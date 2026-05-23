import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type RisPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type RisPaginatedResponse<TItem> = {
  items: TItem[];
  page: RisPagination;
};

export type RisOrderResource = {
  id: string;
  patient_id: string;
  visit_id: string;
  modality: string;
  body_part: string;
  clinical_indication: string;
  status: string;
  radiologist_id?: string | null;
  created_at: string;
};

export async function fetchRisOrders(
  query: { q?: string; status?: string; modality?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<RisPaginatedResponse<RisOrderResource>> {
  const response = await apiClient.get<RisPaginatedResponse<RisOrderResource>>(
    `/ris/orders${toQueryString(query)}`,
    options
  );
  return response.data;
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
