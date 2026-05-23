import Link from "next/link";
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
  CrmLeadResource,
  CrmPaginatedResponse,
  CrmReminderResource
} from "@/app/lib/api";
import { fetchCrmLeads, fetchCrmReminders, isApiError } from "@/app/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
}>;

type LeadFilters = {
  q: string;
  status: string;
};

type LeadDirectoryPanelProps = {
  filters: LeadFilters;
  dataPromise: Promise<CrmPaginatedResponse<CrmLeadResource>>;
};

type ReminderQueuePanelProps = {
  dataPromise: Promise<CrmPaginatedResponse<CrmReminderResource>>;
};

export default async function CrmLeadsPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: LeadFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status)
  };
  const leadsPromise = fetchCrmLeads({
    q: filters.q || undefined,
    status: filters.status || undefined
  });
  const remindersPromise = fetchCrmReminders({ limit: 6 });
  const hasFilters = filters.q.length > 0 || filters.status.length > 0;

  return (
    <AppShell activePath="/crm" eyebrow="Revenue operations" title="CRM Leads">
      <form action="/crm" className="toolbar">
        <label>
          <span>Search leads</span>
          <input defaultValue={filters.q} name="q" placeholder="Lead, company, email, or source" type="search" />
          <FieldHint>Search by contact identity, source, or company metadata.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="new, qualified, won" type="search" />
          <FieldHint>Filter one or more statuses separated by commas.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/crm">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Lead & Contact Directory">
              <LoadingState
                title="Loading leads"
                description="Retrieving lead and contact records from the CRM API."
              />
            </Panel>
          }
        >
          <LeadDirectoryPanel dataPromise={leadsPromise} filters={filters} />
        </Suspense>

        <Suspense
          fallback={
            <Panel title="Reminder Queue">
              <LoadingState
                title="Loading reminders"
                description="Retrieving follow-up reminder priority and status overview."
              />
            </Panel>
          }
        >
          <ReminderQueuePanel dataPromise={remindersPromise} />
        </Suspense>
      </section>
    </AppShell>
  );
}

async function LeadDirectoryPanel({ filters, dataPromise }: LeadDirectoryPanelProps) {
  let response: CrmPaginatedResponse<CrmLeadResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel className="wide-panel" title="Lead & Contact Directory">
        <ErrorState
          title="Unable to load leads"
          description={
            isApiError(error)
              ? `The CRM API responded with an error: ${error.message}`
              : "The CRM API is currently unavailable. Try again in a moment."
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      className="wide-panel"
      meta={describePageWindow(response.page.limit, response.page.offset, response.page.total, "leads")}
      title="Lead & Contact Directory"
    >
      <div className="data-table">
        <div className="table-row table-head">
          <span>Lead / contact</span>
          <span>Company</span>
          <span>Source</span>
          <span>Status</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((lead) => (
            <div className="table-row" key={lead.id}>
              <div>
                <strong>{lead.full_name}</strong>
                <small>
                  {lead.email} | {lead.id}
                </small>
              </div>
              <span>{lead.company}</span>
              <span>{lead.source}</span>
              <StatusBadge tone={statusTone(lead.status)}>{lead.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            title="No leads found"
            description={
              hasLeadFilters(filters)
                ? "No leads match the current query or status filter."
                : "No leads are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

async function ReminderQueuePanel({ dataPromise }: ReminderQueuePanelProps) {
  let response: CrmPaginatedResponse<CrmReminderResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel title="Reminder Queue">
        <ErrorState
          title="Unable to load reminders"
          description={
            isApiError(error)
              ? `The CRM API responded with an error: ${error.message}`
              : "The reminder service is currently unavailable. Try again in a moment."
          }
        />
      </Panel>
    );
  }

  if (response.items.length === 0) {
    return (
      <Panel meta="0 reminders" title="Reminder Queue">
        <EmptyState
          title="No reminders found"
          description="No follow-up reminders are pending in the current CRM view."
        />
      </Panel>
    );
  }

  const summary = summarizeReminders(response.items);

  return (
    <Panel meta={`${response.page.total} reminders`} title="Reminder Queue">
      <div className="key-value-list">
        <div>
          <span>Pending</span>
          <strong>{summary.pendingCount}</strong>
        </div>
        <div>
          <span>High priority</span>
          <strong>{summary.highPriorityCount}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{summary.completedCount}</strong>
        </div>
      </div>

      <div className="data-table compact-top">
        <div className="table-row table-head">
          <span>Reminder</span>
          <span>Priority</span>
          <span>Status</span>
          <span>Due</span>
        </div>
        {response.items.slice(0, 5).map((reminder) => (
          <div className="table-row" key={reminder.id}>
            <div>
              <strong>{reminder.title}</strong>
              <small>{reminder.lead_id}</small>
            </div>
            <StatusBadge tone={priorityTone(reminder.priority)}>{reminder.priority}</StatusBadge>
            <StatusBadge tone={statusTone(reminder.status)}>{reminder.status}</StatusBadge>
            <span>{reminder.due_date}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function hasLeadFilters(filters: LeadFilters): boolean {
  return filters.q.length > 0 || filters.status.length > 0;
}

function readFilterValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "won" || normalized === "active" || normalized === "qualified" || normalized === "completed") {
    return "good";
  }

  if (normalized === "new" || normalized === "pending" || normalized === "in_review" || normalized === "queued") {
    return "warning";
  }

  if (normalized === "lost" || normalized === "overdue" || normalized === "cancelled" || normalized === "archived") {
    return "danger";
  }

  return "neutral";
}

function priorityTone(priority: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = priority.toLowerCase();

  if (normalized === "high" || normalized === "critical" || normalized === "urgent") {
    return "danger";
  }

  if (normalized === "medium") {
    return "warning";
  }

  if (normalized === "low") {
    return "good";
  }

  return "neutral";
}

function summarizeReminders(reminders: CrmReminderResource[]) {
  let pendingCount = 0;
  let completedCount = 0;
  let highPriorityCount = 0;

  for (const reminder of reminders) {
    const status = reminder.status.toLowerCase();
    const priority = reminder.priority.toLowerCase();

    if (status === "completed" || status === "closed") {
      completedCount += 1;
    } else if (status === "pending" || status === "open" || status === "scheduled") {
      pendingCount += 1;
    }

    if (priority === "high" || priority === "critical" || priority === "urgent") {
      highPriorityCount += 1;
    }
  }

  return { pendingCount, completedCount, highPriorityCount };
}

function describePageWindow(limit: number, offset: number, total: number, noun: string): string {
  if (total === 0) {
    return `0 ${noun}`;
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} ${noun}`;
}
