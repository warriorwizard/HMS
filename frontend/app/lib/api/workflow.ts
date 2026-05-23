import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type WorkflowPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type WorkflowPaginatedResponse<TItem> = {
  items: TItem[];
  page: WorkflowPagination;
};

export type WorkflowTaskResource = {
  id: string;
  patient_id: string;
  visit_id: string;
  stage: string;
  status: string;
  assignee_role: string;
  priority: string;
  due_at: string;
  updated_at: string;
};

export type WorkflowQueueResource = {
  id: string;
  patient_id: string;
  visit_id: string;
  stage: string;
  status: string;
  priority: string;
  due_at: string;
  risk_level: string;
};

export async function fetchWorkflowTasks(
  query: { q?: string; stage?: string; status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<WorkflowPaginatedResponse<WorkflowTaskResource>> {
  const response = await apiClient.get<WorkflowPaginatedResponse<WorkflowTaskResource>>(
    `/workflow/tasks${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchTechnicianQueue(
  query: { priority?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<WorkflowPaginatedResponse<WorkflowQueueResource>> {
  const response = await apiClient.get<WorkflowPaginatedResponse<WorkflowQueueResource>>(
    `/workflow/technician-queue${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchDoctorReviewQueue(
  query: { priority?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<WorkflowPaginatedResponse<WorkflowQueueResource>> {
  const response = await apiClient.get<WorkflowPaginatedResponse<WorkflowQueueResource>>(
    `/workflow/doctor-review-queue${toQueryString(query)}`,
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
