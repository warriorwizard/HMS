import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type LimsPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type LimsPaginatedResponse<TItem> = {
  items: TItem[];
  page: LimsPagination;
};

export type LimsSampleResource = {
  id: string;
  accession_number: string;
  patient_id: string;
  visit_id: string;
  sample_type: string;
  status: string;
  collected_at: string;
  verified_by?: string | null;
};

export async function fetchLimsSamples(
  query: { q?: string; status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<LimsPaginatedResponse<LimsSampleResource>> {
  const response = await apiClient.get<LimsPaginatedResponse<LimsSampleResource>>(
    `/lims/samples${toQueryString(query)}`,
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
