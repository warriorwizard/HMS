import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type CopilotPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type CopilotPaginatedResponse<TItem> = {
  items: TItem[];
  page: CopilotPagination;
};

export type CopilotConversationResource = {
  id: string;
  patient_id: string;
  report_id?: string | null;
  title: string;
  created_at: string;
};

export type CopilotMessageResource = {
  id: string;
  conversation_id: string;
  role: string;
  content: string;
  created_at: string;
};

export async function fetchCopilotConversations(
  query: { patient_id?: string; limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<CopilotPaginatedResponse<CopilotConversationResource>> {
  const response = await apiClient.get<CopilotPaginatedResponse<CopilotConversationResource>>(
    `/copilot/conversations${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchCopilotMessages(
  conversationId: string,
  query: { limit?: number; offset?: number } = {},
  options: ApiRequestOptions<never> = {}
): Promise<CopilotPaginatedResponse<CopilotMessageResource>> {
  const response = await apiClient.get<CopilotPaginatedResponse<CopilotMessageResource>>(
    `/copilot/conversations/${conversationId}/messages${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function fetchCopilotContext(
  patientId: string,
  reportId?: string,
  options: ApiRequestOptions<never> = {}
): Promise<{ patient_id: string; report_id?: string | null; context_summary: string }> {
  const query = toQueryString({ patient_id: patientId, report_id: reportId });
  const response = await apiClient.get<{ patient_id: string; report_id?: string | null; context_summary: string }>(
    `/copilot/context${query}`,
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
