import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type CrmPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type CrmPaginatedResponse<TItem> = {
  items: TItem[];
  page: CrmPagination;
};

export type CrmLeadsQuery = {
  q?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type CrmLeadResource = {
  id: string;
  full_name: string;
  company: string;
  email: string;
  status: string;
  source: string;
  phone?: string;
  owner?: string;
};

export type CrmRemindersQuery = {
  q?: string;
  lead_id?: string;
  priority?: string;
  status?: string;
  limit?: number;
  offset?: number;
};

export type CrmReminderResource = {
  id: string;
  lead_id: string;
  title: string;
  due_date: string;
  priority: string;
  status: string;
};

export type CrmCampaignsQuery = {
  q?: string;
  status?: string;
  channel?: string;
  limit?: number;
  offset?: number;
};

export type CrmCampaignResource = {
  id: string;
  name: string;
  channel: string;
  status: string;
  audience: string;
  owner?: string;
  owner_name?: string;
  owner_email?: string;
};

export async function fetchCrmLeads(
  query: CrmLeadsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<CrmPaginatedResponse<CrmLeadResource>> {
  const response = await apiClient.get<CrmPaginatedResponse<CrmLeadResource>>(
    `/crm/leads${toQueryString(query)}`,
    options
  );

  return response.data;
}

export async function fetchCrmReminders(
  query: CrmRemindersQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<CrmPaginatedResponse<CrmReminderResource>> {
  const response = await apiClient.get<CrmPaginatedResponse<CrmReminderResource>>(
    `/crm/reminders${toQueryString(query)}`,
    options
  );

  return response.data;
}

export async function fetchCrmCampaigns(
  query: CrmCampaignsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<CrmPaginatedResponse<CrmCampaignResource>> {
  const response = await apiClient.get<CrmPaginatedResponse<CrmCampaignResource>>(
    `/crm/campaigns${toQueryString(query)}`,
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
