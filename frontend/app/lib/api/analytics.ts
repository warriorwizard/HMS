import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type AnalyticsPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type AnalyticsPaginatedResponse<TItem> = {
  items: TItem[];
  page: AnalyticsPagination;
};

export type AnalyticsEventsQuery = {
  q?: string;
  event_type?: string;
  status?: string;
  department?: string;
  limit?: number;
  offset?: number;
};

export type AnalyticsEventResource = {
  id: string;
  event_type: string;
  status: string;
  department: string;
  source: string;
  created_at: string;
};

export type AnalyticsTatMetricsQuery = {
  status?: string;
  department?: string;
  limit?: number;
  offset?: number;
};

export type AnalyticsTatMetricResource = {
  id: string;
  department: string;
  status: string;
  avg_turnaround_minutes: number;
  p90_turnaround_minutes: number;
  case_count: number;
};

export type AnalyticsWorkflowBottlenecksQuery = {
  status?: string;
  department?: string;
  limit?: number;
  offset?: number;
};

export type AnalyticsWorkflowBottleneckResource = {
  id: string;
  stage: string;
  department: string;
  status: string;
  pending_cases: number;
  sla_breach_percent: number;
};

export type AnalyticsRevenueSummaryQuery = {
  status?: string;
  department?: string;
  limit?: number;
  offset?: number;
};

export type AnalyticsRevenueSummaryResource = {
  id: string;
  period: string;
  department: string;
  status: string;
  revenue_collected: number;
  revenue_outstanding: number;
  currency: string;
};

export type AnalyticsAiUsageQuery = {
  status?: string;
  limit?: number;
  offset?: number;
};

export type AnalyticsAiUsageResource = {
  id: string;
  period: string;
  status: string;
  total_reports: number;
  ai_assisted_reports: number;
  doctor_only_reports: number;
  doctor_override_count: number;
  ai_assist_rate: number;
};

export async function fetchAnalyticsEvents(
  query: AnalyticsEventsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AnalyticsPaginatedResponse<AnalyticsEventResource>> {
  const response = await apiClient.get<AnalyticsPaginatedResponse<AnalyticsEventResource>>(
    `/analytics/events${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchAnalyticsTatMetrics(
  query: AnalyticsTatMetricsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AnalyticsPaginatedResponse<AnalyticsTatMetricResource>> {
  const response = await apiClient.get<AnalyticsPaginatedResponse<AnalyticsTatMetricResource>>(
    `/analytics/tat-metrics${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchAnalyticsWorkflowBottlenecks(
  query: AnalyticsWorkflowBottlenecksQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AnalyticsPaginatedResponse<AnalyticsWorkflowBottleneckResource>> {
  const response = await apiClient.get<AnalyticsPaginatedResponse<AnalyticsWorkflowBottleneckResource>>(
    `/analytics/workflow-bottlenecks${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchAnalyticsRevenueSummary(
  query: AnalyticsRevenueSummaryQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AnalyticsPaginatedResponse<AnalyticsRevenueSummaryResource>> {
  const response = await apiClient.get<AnalyticsPaginatedResponse<AnalyticsRevenueSummaryResource>>(
    `/analytics/revenue-summary${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchAnalyticsAiUsage(
  query: AnalyticsAiUsageQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<AnalyticsPaginatedResponse<AnalyticsAiUsageResource>> {
  const response = await apiClient.get<AnalyticsPaginatedResponse<AnalyticsAiUsageResource>>(
    `/analytics/ai-usage${toQueryString(query)}`,
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
