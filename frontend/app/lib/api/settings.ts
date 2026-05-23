import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type TenantSettingsResource = {
  tenant_id: string;
  name: string;
  slug: string;
  settings: Record<string, unknown>;
};

export async function fetchTenantSettings(
  options: ApiRequestOptions<never> = {}
): Promise<TenantSettingsResource> {
  const response = await apiClient.get<TenantSettingsResource>("/settings/tenant", options);
  return response.data;
}

export async function patchTenantSettings(
  settings: Record<string, unknown>,
  options: ApiRequestOptions<{ settings: Record<string, unknown> }> = {}
): Promise<TenantSettingsResource> {
  const response = await apiClient.patch<TenantSettingsResource>(
    "/settings/tenant",
    { settings },
    options
  );
  return response.data;
}
