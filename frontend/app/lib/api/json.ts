import type { JsonValue } from "./types";

export function isJsonBody(value: unknown): value is JsonValue {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    Array.isArray(value) ||
    (typeof value === "object" && value !== null && !(value instanceof FormData) && !(value instanceof Blob))
  );
}

export function encodeRequestBody(body: unknown): BodyInit | undefined {
  if (body === undefined) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (isJsonBody(body)) {
    return JSON.stringify(body);
  }

  return undefined;
}

export function shouldAttachJsonContentType(body: unknown, headers: Headers): boolean {
  return body !== undefined && !isBodyInit(body) && !headers.has("content-type");
}

export async function readJsonResponse(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  const text = await response.text();
  if (text.length === 0) {
    return null;
  }

  return JSON.parse(text);
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === "string" ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer
  );
}

