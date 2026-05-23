import { apiClient } from "./client";
import type { ApiRequestOptions } from "./types";

export type NotificationsPagination = {
  limit: number;
  offset: number;
  total: number;
};

export type NotificationsPaginatedResponse<TItem> = {
  items: TItem[];
  page: NotificationsPagination;
};

export type NotificationsQuery = {
  q?: string;
  status?: string;
  channel?: string;
  is_read?: boolean;
  limit?: number;
  offset?: number;
};

export type NotificationResource = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  channel: string;
  status: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
};

export type CreateNotificationPayload = {
  user_id: string;
  title: string;
  message: string;
  channel: string;
  status?: string;
};

export async function fetchNotifications(
  query: NotificationsQuery = {},
  options: ApiRequestOptions<never> = {}
): Promise<NotificationsPaginatedResponse<NotificationResource>> {
  const response = await apiClient.get<NotificationsPaginatedResponse<NotificationResource>>(
    `/notifications${toQueryString(query)}`,
    options
  );
  return response.data;
}

export async function createNotification(
  payload: CreateNotificationPayload,
  options: ApiRequestOptions<CreateNotificationPayload> = {}
): Promise<NotificationResource> {
  const response = await apiClient.post<NotificationResource, CreateNotificationPayload>(
    "/notifications",
    payload,
    options
  );
  return response.data;
}

export async function markNotificationRead(
  notificationId: string,
  options: ApiRequestOptions<never> = {}
): Promise<NotificationResource> {
  const response = await apiClient.request<NotificationResource, never>(
    "PATCH",
    `/notifications/${notificationId}/read`,
    options
  );
  return response.data;
}

function toQueryString(query: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();

  for (const [key, rawValue] of Object.entries(query)) {
    if (typeof rawValue === "number") {
      if (Number.isFinite(rawValue)) {
        searchParams.set(key, String(rawValue));
      }
      continue;
    }

    if (typeof rawValue === "boolean") {
      searchParams.set(key, rawValue ? "true" : "false");
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
