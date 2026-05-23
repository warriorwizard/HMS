import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AppShell } from "@/app/components/app-shell";
import {
  EmptyState,
  ErrorState,
  FieldHint,
  LoadingState,
  Panel,
  StatusBadge
} from "@/app/components/workspace-ui";
import type {
  CreateNotificationPayload,
  NotificationResource,
  NotificationsPaginatedResponse
} from "@/app/lib/api/notifications";
import {
  createNotification,
  fetchNotifications,
  markNotificationRead
} from "@/app/lib/api/notifications";
import { isApiError } from "@/app/lib/api/errors";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
  channel?: string | string[] | undefined;
  is_read?: string | string[] | undefined;
  notification_result?: string | string[] | undefined;
  notification_id?: string | string[] | undefined;
  notification_error?: string | string[] | undefined;
}>;

type NotificationFilters = {
  q: string;
  status: string;
  channel: string;
  is_read: string;
};

type NotificationFeedback = {
  kind: "idle" | "success" | "error";
  message: string;
  notificationId: string;
};

type NotificationCenterPanelProps = {
  filters: NotificationFilters;
  dataPromise: Promise<NotificationsPaginatedResponse<NotificationResource>>;
};

type CreateNotificationPanelProps = {
  filters: NotificationFilters;
  feedback: NotificationFeedback;
};

export default async function NotificationsPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: NotificationFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status),
    channel: readFilterValue(params?.channel),
    is_read: readFilterValue(params?.is_read)
  };
  const feedback = readNotificationFeedback(params);
  const dataPromise = fetchNotifications({
    q: filters.q || undefined,
    status: filters.status || undefined,
    channel: filters.channel || undefined,
    is_read: parseIsReadFilter(filters.is_read)
  });
  const hasFilters =
    filters.q.length > 0 ||
    filters.status.length > 0 ||
    filters.channel.length > 0 ||
    filters.is_read.length > 0;

  return (
    <AppShell activePath="/notifications" eyebrow="Operations alerts" title="Notification Center">
      <form action="/notifications" className="toolbar">
        <label>
          <span>Search notifications</span>
          <input defaultValue={filters.q} name="q" placeholder="Title, ID, or message" type="search" />
          <FieldHint>Search by title, message content, or notification ID.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="queued, sent, failed" type="search" />
          <FieldHint>Use one or more comma-separated notification states.</FieldHint>
        </label>
        <label>
          <span>Channel</span>
          <input defaultValue={filters.channel} name="channel" placeholder="in_app, email, sms" type="search" />
          <FieldHint>Filter by delivery channel.</FieldHint>
        </label>
        <label>
          <span>Read state</span>
          <input defaultValue={filters.is_read} name="is_read" placeholder="true or false" type="search" />
          <FieldHint>Use true to show read items, false for unread items.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/notifications">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Inbox">
              <LoadingState title="Loading notifications" description="Retrieving in-app and delivery notifications." />
            </Panel>
          }
        >
          <NotificationCenterPanel dataPromise={dataPromise} filters={filters} />
        </Suspense>
        <CreateNotificationPanel feedback={feedback} filters={filters} />
      </section>
    </AppShell>
  );
}

async function NotificationCenterPanel({ filters, dataPromise }: NotificationCenterPanelProps) {
  let response: NotificationsPaginatedResponse<NotificationResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel className="wide-panel" title="Inbox">
        <ErrorState
          title="Unable to load notifications"
          description={
            isApiError(error)
              ? `The notifications API responded with an error: ${error.message}`
              : "The notifications API is currently unavailable. Try again in a moment."
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      className="wide-panel"
      meta={describePageWindow(response.page.limit, response.page.offset, response.page.total)}
      title="Inbox"
    >
      <div className="data-table reports-table">
        <div className="table-row table-head">
          <span>Notification</span>
          <span>Channel</span>
          <span>Status</span>
          <span>State</span>
          <span>Action</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((item) => (
            <div className="table-row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <small>
                  {item.id} | {item.created_at}
                </small>
                <small>{item.message}</small>
              </div>
              <span>{item.channel}</span>
              <StatusBadge tone={statusTone(item.status)}>{item.status}</StatusBadge>
              <StatusBadge tone={item.is_read ? "good" : "warning"}>
                {item.is_read ? "read" : "unread"}
              </StatusBadge>
              {item.is_read ? (
                <span>Read</span>
              ) : (
                <form action={markReadAction}>
                  <input name="notification_id" type="hidden" value={item.id} />
                  <input name="current_q" type="hidden" value={filters.q} />
                  <input name="current_status" type="hidden" value={filters.status} />
                  <input name="current_channel" type="hidden" value={filters.channel} />
                  <input name="current_is_read" type="hidden" value={filters.is_read} />
                  <button type="submit">Mark read</button>
                </form>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            title="No notifications found"
            description={
              hasFilters(filters)
                ? "No notifications match the current filters."
                : "No notifications are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

function CreateNotificationPanel({ filters, feedback }: CreateNotificationPanelProps) {
  return (
    <Panel title="Create Notification">
      {feedback.kind === "success" ? (
        <FieldHint tone="good">
          Notification created successfully
          {feedback.notificationId ? ` (ID: ${feedback.notificationId})` : ""}.
        </FieldHint>
      ) : null}
      {feedback.kind === "error" ? (
        <ErrorState title="Unable to create notification" description={feedback.message} />
      ) : null}

      <form action={createNotificationAction} className="rule-list compact-top">
        <input name="current_q" type="hidden" value={filters.q} />
        <input name="current_status" type="hidden" value={filters.status} />
        <input name="current_channel" type="hidden" value={filters.channel} />
        <input name="current_is_read" type="hidden" value={filters.is_read} />

        <label>
          <span>User ID</span>
          <input className="config-input" defaultValue="usr_ops" name="user_id" required type="text" />
        </label>
        <label>
          <span>Title</span>
          <input className="config-input" name="title" placeholder="Escalation alert" required type="text" />
        </label>
        <label>
          <span>Message</span>
          <input className="config-input" name="message" placeholder="Short notification message" required type="text" />
        </label>
        <label>
          <span>Channel</span>
          <input className="config-input" defaultValue="in_app" name="channel" required type="text" />
        </label>
        <label>
          <span>Status</span>
          <input className="config-input" defaultValue="queued" name="status" required type="text" />
        </label>
        <button type="submit">Create notification</button>
      </form>
    </Panel>
  );
}

async function createNotificationAction(formData: FormData) {
  "use server";

  const filters: NotificationFilters = {
    q: readFormValue(formData.get("current_q")),
    status: readFormValue(formData.get("current_status")),
    channel: readFormValue(formData.get("current_channel")),
    is_read: readFormValue(formData.get("current_is_read"))
  };
  const payload: CreateNotificationPayload = {
    user_id: readFormValue(formData.get("user_id")),
    title: readFormValue(formData.get("title")),
    message: readFormValue(formData.get("message")),
    channel: readFormValue(formData.get("channel")),
    status: readFormValue(formData.get("status")) || "queued"
  };

  if (!payload.user_id || !payload.title || !payload.message || !payload.channel || !payload.status) {
    redirect(
      buildNotificationsHref(filters, {
        notification_result: "error",
        notification_error: "All notification fields are required."
      })
    );
  }

  try {
    const created = await createNotification(payload);
    redirect(
      buildNotificationsHref(filters, {
        notification_result: "success",
        notification_id: created.id
      })
    );
  } catch (error) {
    const message = isApiError(error) ? error.message : "The notification API is unavailable.";
    redirect(
      buildNotificationsHref(filters, {
        notification_result: "error",
        notification_error: message
      })
    );
  }
}

async function markReadAction(formData: FormData) {
  "use server";

  const filters: NotificationFilters = {
    q: readFormValue(formData.get("current_q")),
    status: readFormValue(formData.get("current_status")),
    channel: readFormValue(formData.get("current_channel")),
    is_read: readFormValue(formData.get("current_is_read"))
  };
  const notificationId = readFormValue(formData.get("notification_id"));
  if (!notificationId) {
    redirect(
      buildNotificationsHref(filters, {
        notification_result: "error",
        notification_error: "Notification ID is required."
      })
    );
  }

  try {
    await markNotificationRead(notificationId);
    redirect(
      buildNotificationsHref(filters, {
        notification_result: "success",
        notification_id: notificationId
      })
    );
  } catch (error) {
    const message = isApiError(error) ? error.message : "Failed to mark notification as read.";
    redirect(
      buildNotificationsHref(filters, {
        notification_result: "error",
        notification_error: message
      })
    );
  }
}

function describePageWindow(limit: number, offset: number, total: number): string {
  if (total === 0) {
    return "0 notifications";
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} notifications`;
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "sent" || normalized === "delivered") {
    return "good";
  }

  if (normalized === "queued" || normalized === "pending") {
    return "warning";
  }

  if (normalized === "failed" || normalized === "rejected") {
    return "danger";
  }

  return "neutral";
}

function readFilterValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }
  return value?.trim() ?? "";
}

function readFormValue(value: FormDataEntryValue | null): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

function parseIsReadFilter(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }
  if (normalized === "false") {
    return false;
  }
  return undefined;
}

function hasFilters(filters: NotificationFilters): boolean {
  return (
    filters.q.length > 0 ||
    filters.status.length > 0 ||
    filters.channel.length > 0 ||
    filters.is_read.length > 0
  );
}

function readNotificationFeedback(
  params:
    | {
        notification_result?: string | string[] | undefined;
        notification_id?: string | string[] | undefined;
        notification_error?: string | string[] | undefined;
      }
    | undefined
): NotificationFeedback {
  const kind = readFilterValue(params?.notification_result).toLowerCase();
  if (kind === "success") {
    return {
      kind: "success",
      message: "",
      notificationId: readFilterValue(params?.notification_id)
    };
  }
  if (kind === "error") {
    return {
      kind: "error",
      message: readFilterValue(params?.notification_error) || "Request failed.",
      notificationId: ""
    };
  }
  return {
    kind: "idle",
    message: "",
    notificationId: ""
  };
}

function buildNotificationsHref(
  filters: NotificationFilters,
  extra: Record<string, string>
): string {
  const params = new URLSearchParams();

  if (filters.q.trim().length > 0) {
    params.set("q", filters.q.trim());
  }
  if (filters.status.trim().length > 0) {
    params.set("status", filters.status.trim());
  }
  if (filters.channel.trim().length > 0) {
    params.set("channel", filters.channel.trim());
  }
  if (filters.is_read.trim().length > 0) {
    params.set("is_read", filters.is_read.trim());
  }

  for (const [key, value] of Object.entries(extra)) {
    if (value.trim().length > 0) {
      params.set(key, value.trim());
    }
  }

  const query = params.toString();
  return query.length > 0 ? `/notifications?${query}` : "/notifications";
}
