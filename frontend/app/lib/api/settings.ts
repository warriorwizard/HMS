import { apiClient } from "./client";
import type { ApiRequestOptions, JsonObject } from "./types";

export type TenantSettingsResource = {
  tenant_id: string;
  name: string;
  slug: string;
  settings: JsonObject;
};

export async function fetchTenantSettings(
  options: ApiRequestOptions<never> = {}
): Promise<TenantSettingsResource> {
  const response = await apiClient.get<TenantSettingsResource>("/settings/tenant", options);
  return response.data;
}

export async function patchTenantSettings(
  settings: JsonObject,
  options: ApiRequestOptions<{ settings: JsonObject }> = {}
): Promise<TenantSettingsResource> {
  const response = await apiClient.patch<TenantSettingsResource, { settings: JsonObject }>(
    "/settings/tenant",
    { settings },
    options
  );
  return response.data;
}
