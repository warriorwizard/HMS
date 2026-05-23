import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type HealthResource = {
  status: string;
  service: string;
  environment: string;
  version: string;
  request_id: string;
  correlation_id: string;
};

export type SystemInfoResource = {
  project: string;
  service: string;
  environment: string;
  api_prefix: string;
  version: string;
};

export async function fetchHealth(options: ApiRequestOptions<never> = {}): Promise<HealthResource> {
  const response = await apiClient.get<HealthResource>("/health", {
    skipAuth: true,
    ...options
  });

  return response.data;
}

export async function fetchSystemInfo(options: ApiRequestOptions<never> = {}): Promise<SystemInfoResource> {
  const response = await apiClient.get<SystemInfoResource>("/system/info", {
    skipAuth: true,
    ...options
  });

  return response.data;
}
