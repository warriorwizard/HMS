export type JsonPrimitive = string | number | boolean | null;

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

export type JsonObject = {
  [key: string]: JsonValue;
};

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiAuthTokenProvider = () => string | null | Promise<string | null>;

export type ApiAccessHandlerContext = {
  method: ApiMethod;
  path: string;
  status: 401 | 403;
  requestId?: string;
  correlationId?: string;
};

export type ApiAccessHandler = (context: ApiAccessHandlerContext) => void | Promise<void>;

export type ApiClientConfig = {
  baseUrl?: string;
  bearerToken?: string | null;
  getBearerToken?: ApiAuthTokenProvider;
  onUnauthorized?: ApiAccessHandler;
  onForbidden?: ApiAccessHandler;
  defaultHeaders?: HeadersInit;
};

export type ApiRequestOptions<TBody = JsonValue> = {
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
  bearerToken?: string | null;
  skipAuth?: boolean;
  requestId?: string;
  tenantId?: string;
};

export type ApiResponseMeta = {
  status: number;
  headers: Headers;
  requestId?: string;
  correlationId?: string;
};

export type ApiResponse<TData> = {
  data: TData;
  meta: ApiResponseMeta;
};

