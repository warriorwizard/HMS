import type { ApiMethod, JsonObject } from "./types";

export type ApiErrorCode =
  | "ABORTED"
  | "FORBIDDEN"
  | "HTTP_ERROR"
  | "INVALID_JSON"
  | "NETWORK_ERROR"
  | "UNAUTHORIZED";

export type ApiErrorInput = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  method?: ApiMethod;
  path?: string;
  details?: unknown;
  requestId?: string;
  correlationId?: string;
  cause?: unknown;
};

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status?: number;
  readonly method?: ApiMethod;
  readonly path?: string;
  readonly details?: unknown;
  readonly requestId?: string;
  readonly correlationId?: string;
  override readonly cause?: unknown;

  constructor(input: ApiErrorInput) {
    super(input.message);
    this.name = "ApiError";
    this.code = input.code;
    this.status = input.status;
    this.method = input.method;
    this.path = input.path;
    this.details = input.details;
    this.requestId = input.requestId;
    this.correlationId = input.correlationId;
    this.cause = input.cause;
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function normalizeApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isAbortError(error)) {
    return new ApiError({
      code: "ABORTED",
      message: "The request was cancelled.",
      cause: error
    });
  }

  return new ApiError({
    code: "NETWORK_ERROR",
    message: error instanceof Error ? error.message : "The request failed before the server responded.",
    cause: error
  });
}

export function codeForStatus(status: number): ApiErrorCode {
  if (status === 401) {
    return "UNAUTHORIZED";
  }

  if (status === 403) {
    return "FORBIDDEN";
  }

  return "HTTP_ERROR";
}

export function messageFromErrorBody(body: unknown, fallback: string): string {
  if (!isJsonObject(body)) {
    return fallback;
  }

  const directMessage = body.message;
  if (typeof directMessage === "string" && directMessage.length > 0) {
    return directMessage;
  }

  const nestedError = body.error;
  if (isJsonObject(nestedError) && typeof nestedError.message === "string") {
    return nestedError.message;
  }

  return fallback;
}

export function detailsFromErrorBody(body: unknown): unknown {
  if (!isJsonObject(body)) {
    return body;
  }

  const nestedError = body.error;
  if (isJsonObject(nestedError) && "details" in nestedError) {
    return nestedError.details;
  }

  if ("details" in body) {
    return body.details;
  }

  return body;
}

export function requestIdFromHeadersOrBody(headers: Headers, body: unknown): string | undefined {
  const headerValue =
    headers.get("x-request-id") ??
    headers.get("x-proxohms-request-id");
  if (headerValue) {
    return headerValue;
  }

  return stringFieldFromBody(body, "requestId") ?? stringFieldFromBody(body, "request_id");
}

export function correlationIdFromHeadersOrBody(headers: Headers, body: unknown): string | undefined {
  const headerValue =
    headers.get("x-correlation-id") ??
    headers.get("x-proxohms-correlation-id");
  if (headerValue) {
    return headerValue;
  }

  return stringFieldFromBody(body, "correlationId") ?? stringFieldFromBody(body, "correlation_id");
}

function stringFieldFromBody(body: unknown, key: string): string | undefined {
  if (!isJsonObject(body)) {
    return undefined;
  }

  const directValue = body[key];
  if (typeof directValue === "string") {
    return directValue;
  }

  const nestedError = body.error;
  if (!isJsonObject(nestedError)) {
    return undefined;
  }

  const nestedValue = nestedError[key];
  return typeof nestedValue === "string" ? nestedValue : undefined;
}

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
