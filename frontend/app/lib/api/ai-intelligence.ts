import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type AiPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type AiPaginatedResponse<TItem> = {
  items: TItem[];
  page: AiPagination;
};

export type AiExplainabilitySourceResource = {
  source_type: string;
  source_id: string;
  excerpt: string;
};

export type AiResultResource = {
  id: string;
  report_id: string;
  patient_id: string;
  status: string;
  risk_score: number;
  summary: string;
  findings: string[];
  explainability: AiExplainabilitySourceResource[];
  created_at: string;
};

export async function fetchAiResults(
  query: { q?: string; status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<AiPaginatedResponse<AiResultResource>> {
  const response = await apiClient.get<AiPaginatedResponse<AiResultResource>>(
    `/ai/results${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchRiskScore(
  reportId: string,
  options: ApiRequestOptions<never> = {}
): Promise<{ report_id: string; risk_score: number; risk_level: string; rationale: string }> {
  const response = await apiClient.get<{
    report_id: string;
    risk_score: number;
    risk_level: string;
    rationale: string;
  }>(`/ai/reports/${reportId}/risk-score`, options);
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
