import { getApiBaseUrl, joinApiUrl } from "./config";
import {
  ApiError,
  codeForStatus,
  correlationIdFromHeadersOrBody,
  detailsFromErrorBody,
  messageFromErrorBody,
  normalizeApiError,
  requestIdFromHeadersOrBody
} from "./errors";
import { encodeRequestBody, readJsonResponse, shouldAttachJsonContentType } from "./json";
import type { ApiClientConfig, ApiMethod, ApiRequestOptions, ApiResponse, JsonValue } from "./types";

const EMPTY_BODY_METHODS = new Set<ApiMethod>(["GET", "DELETE"]);

export type ApiClient = {
  request: <TData, TBody = JsonValue>(
    method: ApiMethod,
    path: string,
    options?: ApiRequestOptions<TBody>
  ) => Promise<ApiResponse<TData>>;
  get: <TData>(path: string, options?: ApiRequestOptions<never>) => Promise<ApiResponse<TData>>;
  post: <TData, TBody = JsonValue>(path: string, body?: TBody, options?: ApiRequestOptions<TBody>) => Promise<ApiResponse<TData>>;
  put: <TData, TBody = JsonValue>(path: string, body?: TBody, options?: ApiRequestOptions<TBody>) => Promise<ApiResponse<TData>>;
  patch: <TData, TBody = JsonValue>(path: string, body?: TBody, options?: ApiRequestOptions<TBody>) => Promise<ApiResponse<TData>>;
  delete: <TData>(path: string, options?: ApiRequestOptions<never>) => Promise<ApiResponse<TData>>;
};

export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  const baseUrl = config.baseUrl ?? getApiBaseUrl();

  async function request<TData, TBody = JsonValue>(
    method: ApiMethod,
    path: string,
    options: ApiRequestOptions<TBody> = {}
  ): Promise<ApiResponse<TData>> {
    const headers = buildHeaders(config.defaultHeaders, options.headers);
    const body = EMPTY_BODY_METHODS.has(method) ? undefined : options.body;
    const encodedBody = encodeRequestBody(body);
    const bearerToken = await resolveBearerToken(config, options);

    if (shouldAttachJsonContentType(body, headers)) {
      headers.set("content-type", "application/json");
    }

    headers.set("accept", headers.get("accept") ?? "application/json");

    if (bearerToken) {
      headers.set("authorization", `Bearer ${bearerToken}`);
    }

    if (options.requestId) {
      headers.set("x-request-id", options.requestId);
    }

    if (options.tenantId) {
      headers.set("x-tenant-id", options.tenantId);
    }

    try {
      const response = await fetch(joinApiUrl(baseUrl, path), {
        body: encodedBody,
        headers,
        method,
        signal: options.signal
      });
      const parsedBody = await parseResponseBody(response, method, path);
      const requestId = requestIdFromHeadersOrBody(response.headers, parsedBody);
      const correlationId = correlationIdFromHeadersOrBody(response.headers, parsedBody);

      if (!response.ok) {
        await notifyAccessHandlers(config, method, path, response.status, requestId, correlationId);

        throw new ApiError({
          code: codeForStatus(response.status),
          message: messageFromErrorBody(parsedBody, `Request failed with status ${response.status}.`),
          status: response.status,
          method,
          path,
          details: detailsFromErrorBody(parsedBody),
          requestId,
          correlationId
        });
      }

      return {
        data: parsedBody as TData,
        meta: {
          status: response.status,
          headers: response.headers,
          requestId,
          correlationId
        }
      };
    } catch (error) {
      throw normalizeApiError(error);
    }
  }

  return {
    request,
    get: (path, options) => request("GET", path, options),
    post: (path, body, options = {}) => request("POST", path, { ...options, body }),
    put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
    patch: (path, body, options = {}) => request("PATCH", path, { ...options, body }),
    delete: (path, options) => request("DELETE", path, options)
  };
}

export const apiClient = createApiClient();

function buildHeaders(defaultHeaders?: HeadersInit, requestHeaders?: HeadersInit): Headers {
  const headers = new Headers(defaultHeaders);

  if (requestHeaders) {
    new Headers(requestHeaders).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

async function resolveBearerToken<TBody>(
  config: ApiClientConfig,
  options: ApiRequestOptions<TBody>
): Promise<string | null> {
  if (options.skipAuth) {
    return null;
  }

  if (options.bearerToken !== undefined) {
    return options.bearerToken;
  }

  if (config.bearerToken !== undefined) {
    return config.bearerToken;
  }

  return config.getBearerToken?.() ?? null;
}

async function parseResponseBody(response: Response, method: ApiMethod, path: string): Promise<unknown> {
  try {
    return await readJsonResponse(response);
  } catch (error) {
    throw new ApiError({
      code: "INVALID_JSON",
      message: "The server returned a response that could not be parsed as JSON.",
      status: response.status,
      method,
      path,
      cause: error
    });
  }
}

async function notifyAccessHandlers(
  config: ApiClientConfig,
  method: ApiMethod,
  path: string,
  status: number,
  requestId?: string,
  correlationId?: string
): Promise<void> {
  if (status === 401) {
    await config.onUnauthorized?.({ method, path, status, requestId, correlationId });
  }

  if (status === 403) {
    await config.onForbidden?.({ method, path, status, requestId, correlationId });
  }
}

