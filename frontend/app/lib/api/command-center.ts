import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type CommandCenterPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type CommandCenterPaginatedResponse<TItem> = {
  items: TItem[];
  page: CommandCenterPagination;
};

export type CommandCenterQueueResource = {
  id: string;
  patient_id: string;
  report_id: string;
  priority: string;
  status: string;
  owner: string;
  recommendation: string;
  due_at: string;
};

export async function fetchCommandCenterQueue(
  query: { q?: string; priority?: string; status?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<CommandCenterPaginatedResponse<CommandCenterQueueResource>> {
  const response = await apiClient.get<CommandCenterPaginatedResponse<CommandCenterQueueResource>>(
    `/command-center/queue${toQueryString(query)}`,
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
