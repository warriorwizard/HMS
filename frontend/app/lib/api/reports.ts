import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type ReportsPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type ReportsPaginatedResponse<TItem> = {
  items: TItem[];
  page: ReportsPagination;
};

export type ReportResource = {
  id: string;
  patient_id: string;
  visit_id: string;
  file_name: string;
  file_type: string;
  status: string;
  storage_key: string;
  uploaded_by: string;
  uploaded_at: string;
};

export type ProcessingJobResource = {
  id: string;
  report_id: string;
  status: string;
  stage: string;
  started_at: string;
  updated_at: string;
  extraction_preview: string;
};

export async function fetchReports(
  query: { q?: string; status?: string; file_type?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<ReportsPaginatedResponse<ReportResource>> {
  const response = await apiClient.get<ReportsPaginatedResponse<ReportResource>>(
    `/reports${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchReportProcessingJobs(
  query: { status?: string; stage?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<ReportsPaginatedResponse<ProcessingJobResource>> {
  const response = await apiClient.get<ReportsPaginatedResponse<ProcessingJobResource>>(
    `/reports/processing-jobs${toQueryString(query)}`,
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
