import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type AdminPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type AdminPaginatedResponse<TItem> = {
  items: TItem[];
  page: AdminPagination;
};

type PaginationFields = {
  limit?: number;
  offset?: number;
  total?: number;
  page?: number;
  page_size?: number;
};

type PaginatedEnvelope<TItem> = PaginationFields & {
  items?: TItem[];
  data?: TItem[];
  page?: PaginationFields;
  meta?: PaginationFields;
  pagination?: PaginationFields;
};

export type AdminTenantsQuery = {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type AdminTenantResource = {
  id: string;
  name: string;
  slug: string;
  status: string;
  site_count?: number;
  department_count?: number;
  membership_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type AdminMembershipsQuery = {
  q?: string;
  status?: string;
  tenant_id?: string;
  role_key?: string;
  limit?: number;
  offset?: number;
};

export type AdminMembershipUserSummary = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
};

export type AdminMembershipTenantSummary = {
  id: string;
  name: string;
  slug: string;
  status?: string;
};

export type AdminMembershipRoleSummary = {
  id: string;
  key: string;
  name: string;
  status?: string;
  permission_count?: number;
};

export type AdminMembershipResource = {
  id: string;
  tenant_id: string;
  user_id: string;
  role_id: string;
  status: string;
  permission_count?: number;
  created_at?: string;
  updated_at?: string;
  user?: AdminMembershipUserSummary;
  tenant?: AdminMembershipTenantSummary;
  role?: AdminMembershipRoleSummary;
};

export async function fetchAdminTenants(
  query: AdminTenantsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AdminPaginatedResponse<AdminTenantResource>> {
  const response = await apiClient.get<PaginatedEnvelope<AdminTenantResource>>(
    `/admin/tenants${toQueryString(query)}`,
    options
  );

  return normalizePaginatedResponse(response.data, query.limit, query.offset);
}

export async function fetchAdminMemberships(
  query: AdminMembershipsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AdminPaginatedResponse<AdminMembershipResource>> {
  const response = await apiClient.get<PaginatedEnvelope<AdminMembershipResource>>(
    `/admin/memberships${toQueryString(query)}`,
    options
  );

  return normalizePaginatedResponse(response.data, query.limit, query.offset);
}

function toQueryString(query: Record<string, string | number | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    if (typeof rawValue === "number") {
      if (Number.isFinite(rawValue)) {
        searchParams.set(key, String(rawValue));
      }
      continue;
    }

    if (typeof rawValue === "string") {
      const trimmed = rawValue.trim();
      if (trimmed.length > 0) {
        searchParams.set(key, trimmed);
      }
    }
  }

  const serialized = searchParams.toString();
  return serialized.length > 0 ? `?${serialized}` : "";
}

function normalizePaginatedResponse<TItem>(
  payload: PaginatedEnvelope<TItem>,
  fallbackLimit?: number,
  fallbackOffset?: number
): AdminPaginatedResponse<TItem> {
  const items = payload.items ?? payload.data ?? [];
  const fields = payload.page ?? payload.pagination ?? payload.meta ?? payload;
  const fallbackSafeLimit = fallbackLimit ?? Math.max(items.length, 1);
  const fallbackSafeOffset = fallbackOffset ?? 0;
  const limitFromFields = fields.limit ?? fields.page_size;
  const offsetFromFields =
    fields.offset ??
    (typeof fields.page === "number" && typeof limitFromFields === "number"
      ? Math.max(0, (Math.trunc(fields.page) - 1) * Math.trunc(limitFromFields))
      : undefined);
  const limit = readPositiveInt(limitFromFields, fallbackSafeLimit);
  const offset = readNonNegativeInt(offsetFromFields, fallbackSafeOffset);
  const total = readNonNegativeInt(fields.total, items.length);

  return {
    items,
    page: {
      limit,
      offset,
      total
    }
  };
}

function readPositiveInt(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return fallback;
  }

  return Math.trunc(value);
}

function readNonNegativeInt(value: number | undefined, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return Math.trunc(value);
}
