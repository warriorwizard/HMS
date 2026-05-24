const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000/api/v1";

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  return trimTrailingSlash(process.env.NEXT_PUBLIC_PROXOHMS_API_BASE_URL ?? DEFAULT_API_BASE_URL);
}

export function joinApiUrl(baseUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedBaseUrl = trimTrailingSlash(baseUrl);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}
