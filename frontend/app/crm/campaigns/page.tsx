import Link from "next/link";
import { Suspense } from "react";

import { AppShell } from "@/app/components/app-shell";
import {
  EmptyState,
  FieldHint,
  LoadingState,
  Panel,
  StatusBadge
} from "@/app/components/workspace-ui";
import type { CrmCampaignResource, CrmPaginatedResponse } from "@/app/lib/api";
import { fetchCrmCampaigns, isApiError } from "@/app/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
  channel?: string | string[] | undefined;
}>;

type CampaignFilters = {
  q: string;
  status: string;
  channel: string;
};

type CampaignPanelProps = {
  filters: CampaignFilters;
  dataPromise: Promise<CrmPaginatedResponse<CrmCampaignResource>>;
};

export default async function CrmCampaignsPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: CampaignFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status),
    channel: readFilterValue(params?.channel)
  };
  const dataPromise = fetchCrmCampaigns({
    q: filters.q || undefined,
    status: filters.status || undefined,
    channel: filters.channel || undefined
  });
  const hasFilters = filters.q.length > 0 || filters.status.length > 0 || filters.channel.length > 0;

  return (
    <AppShell activePath="/crm/campaigns" eyebrow="Revenue operations" title="Campaign Tracking">
      <form action="/crm/campaigns" className="toolbar">
        <label>
          <span>Search campaigns</span>
          <input defaultValue={filters.q} name="q" placeholder="Campaign, ID, audience" type="search" />
          <FieldHint>Search by campaign name, identifier, channel, or audience.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="active, draft, paused" type="search" />
          <FieldHint>Use one or more comma-separated statuses.</FieldHint>
        </label>
        <label>
          <span>Channel</span>
          <input defaultValue={filters.channel} name="channel" placeholder="email, sms, social" type="search" />
          <FieldHint>Filter by campaign channel.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/crm/campaigns">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Campaign List">
              <LoadingState
                title="Loading campaigns"
                description="Retrieving campaign status and channel tracking from the CRM API."
              />
            </Panel>
          }
        >
          <CampaignPanel dataPromise={dataPromise} filters={filters} />
        </Suspense>

        <Panel title="Quick Filters">
          <div className="key-value-list">
            <div>
              <span>Status</span>
              <strong>{filters.status || "All statuses"}</strong>
            </div>
            <div>
              <span>Channel</span>
              <strong>{filters.channel || "All channels"}</strong>
            </div>
            <div>
              <span>Search</span>
              <strong>{filters.q || "None"}</strong>
            </div>
          </div>
          <div className="action-bar">
            <Link className="button-link secondary" href={buildCampaignFilterHref({ ...filters, status: "active" })}>
              Active
            </Link>
            <Link className="button-link secondary" href={buildCampaignFilterHref({ ...filters, status: "draft" })}>
              Draft
            </Link>
            <Link className="button-link secondary" href={buildCampaignFilterHref({ ...filters, status: "paused" })}>
              Paused
            </Link>
          </div>
        </Panel>
      </section>
    </AppShell>
  );
}

async function CampaignPanel({ filters, dataPromise }: CampaignPanelProps) {
  let response: CrmPaginatedResponse<CrmCampaignResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return <CampaignFallback filters={filters} message={campaignMessage(error)} />;
  }

  return (
    <Panel
      className="wide-panel"
      meta={describePageWindow(response.page.limit, response.page.offset, response.page.total)}
      title="Campaign List"
    >
      <div className="data-table reports-table">
        <div className="table-row table-head">
          <span>Campaign</span>
          <span>Channel</span>
          <span>Audience</span>
          <span>Status</span>
          <span>ID</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((campaign) => (
            <div className="table-row" key={campaign.id}>
              <div>
                <strong>{campaign.name}</strong>
                <small>{campaign.id}</small>
              </div>
              <span>{campaign.channel}</span>
              <span>{campaign.audience}</span>
              <StatusBadge tone={statusTone(campaign.status)}>{campaign.status}</StatusBadge>
              <span>{campaign.id}</span>
            </div>
          ))
        ) : (
          <EmptyState
            title="No campaigns found"
            description={
              hasCampaignFilters(filters)
                ? "No campaigns match the selected query or filters."
                : "No campaigns are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

function CampaignFallback({
  filters,
  message
}: {
  filters: CampaignFilters;
  message: string;
}) {
  const campaigns = [
    {
      id: "CMP-221",
      name: "High-risk follow-up recovery",
      channel: "sms",
      audience: "Missed review patients",
      status: "active"
    },
    {
      id: "CMP-218",
      name: "B2B referral partner nurture",
      channel: "email",
      audience: "Diagnostic centers",
      status: "draft"
    },
    {
      id: "CMP-207",
      name: "Preventive health camp",
      channel: "social",
      audience: "Corporate employees",
      status: "paused"
    }
  ];
  const query = filters.q.toLowerCase();
  const status = filters.status.toLowerCase();
  const channel = filters.channel.toLowerCase();
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesQuery =
      query.length === 0 ||
      [campaign.id, campaign.name, campaign.channel, campaign.audience]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = status.length === 0 || campaign.status.includes(status);
    const matchesChannel = channel.length === 0 || campaign.channel.includes(channel);
    return matchesQuery && matchesStatus && matchesChannel;
  });

  return (
    <Panel className="wide-panel" meta={`${filteredCampaigns.length} campaigns`} title="Campaign List">
      <FieldHint tone="warning">{message} Showing campaign tracking snapshot.</FieldHint>
      <div className="data-table reports-table compact-top">
        <div className="table-row table-head">
          <span>Campaign</span>
          <span>Channel</span>
          <span>Audience</span>
          <span>Status</span>
          <span>ID</span>
        </div>
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <div className="table-row" key={campaign.id}>
              <div>
                <strong>{campaign.name}</strong>
                <small>{campaign.id}</small>
              </div>
              <span>{campaign.channel}</span>
              <span>{campaign.audience}</span>
              <StatusBadge tone={statusTone(campaign.status)}>{campaign.status}</StatusBadge>
              <span>{campaign.id}</span>
            </div>
          ))
        ) : (
          <EmptyState title="No campaigns found" description="No demo campaigns match the current filters." />
        )}
      </div>
    </Panel>
  );
}

function campaignMessage(error: unknown): string {
  return isApiError(error)
    ? `The CRM API responded with an error: ${error.message}.`
    : "The CRM API is currently unavailable.";
}

function buildCampaignFilterHref(filters: CampaignFilters): string {
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

  const queryString = params.toString();
  return queryString.length > 0 ? `/crm/campaigns?${queryString}` : "/crm/campaigns";
}

function hasCampaignFilters(filters: CampaignFilters): boolean {
  return filters.q.length > 0 || filters.status.length > 0 || filters.channel.length > 0;
}

function readFilterValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "active" || normalized === "running") {
    return "good";
  }

  if (normalized === "draft" || normalized === "pending" || normalized === "scheduled") {
    return "warning";
  }

  if (normalized === "paused" || normalized === "stopped" || normalized === "cancelled") {
    return "danger";
  }

  return "neutral";
}

function describePageWindow(limit: number, offset: number, total: number): string {
  if (total === 0) {
    return "0 campaigns";
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} campaigns`;
}
