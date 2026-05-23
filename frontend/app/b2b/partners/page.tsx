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
  B2bPaginatedResponse,
  B2bPartnerResource,
  B2bPricingRuleResource
} from "@/app/lib/api";
import { fetchB2bPartners, fetchB2bPricingRules, isApiError } from "@/app/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
}>;

type PartnerFilters = {
  q: string;
  status: string;
};

type PartnerDirectoryPanelProps = {
  filters: PartnerFilters;
  dataPromise: Promise<B2bPaginatedResponse<B2bPartnerResource>>;
};

type PricingRulesPanelProps = {
  filters: PartnerFilters;
  dataPromise: Promise<B2bPaginatedResponse<B2bPricingRuleResource>>;
};

export default async function B2bPartnersPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: PartnerFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status)
  };
  const partnersPromise = fetchB2bPartners({
    q: filters.q || undefined,
    status: filters.status || undefined
  });
  const pricingRulesPromise = fetchB2bPricingRules({
    q: filters.q || undefined,
    status: filters.status || undefined,
    limit: 8
  });
  const hasFilters = filters.q.length > 0 || filters.status.length > 0;

  return (
    <AppShell activePath="/b2b/partners" eyebrow="B2B management" title="Partner Directory">
      <form action="/b2b/partners" className="toolbar">
        <label>
          <span>Search partners</span>
          <input defaultValue={filters.q} name="q" placeholder="Name, code, contact, or city" type="search" />
          <FieldHint>Search by partner identity, contact metadata, or location.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="active, pending, inactive" type="search" />
          <FieldHint>Use one or more comma-separated statuses.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/b2b/partners">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Partner Table">
              <LoadingState
                title="Loading partners"
                description="Retrieving B2B partner records from the partner directory API."
              />
            </Panel>
          }
        >
          <PartnerDirectoryPanel dataPromise={partnersPromise} filters={filters} />
        </Suspense>

        <Suspense
          fallback={
            <Panel title="Pricing Rules Snapshot">
              <LoadingState
                title="Loading pricing rules"
                description="Retrieving B2B pricing contracts and rule status summary."
              />
            </Panel>
          }
        >
          <PricingRulesPanel dataPromise={pricingRulesPromise} filters={filters} />
        </Suspense>
      </section>
    </AppShell>
  );
}

async function PartnerDirectoryPanel({ filters, dataPromise }: PartnerDirectoryPanelProps) {
  let response: B2bPaginatedResponse<B2bPartnerResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel className="wide-panel" title="Partner Table">
        <ErrorState
          title="Unable to load partners"
          description={
            isApiError(error)
              ? `The B2B API responded with an error: ${error.message}`
              : "The B2B partner API is currently unavailable. Try again in a moment."
          }
        />
      </Panel>
    );
  }

  return (
    <Panel
      className="wide-panel"
      meta={describePageWindow(response.page.limit, response.page.offset, response.page.total, "partners")}
      title="Partner Table"
    >
      <div className="data-table">
        <div className="table-row table-head">
          <span>Partner</span>
          <span>Primary contact</span>
          <span>Status</span>
          <span>Segment</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((partner) => (
            <div className="table-row" key={partner.id}>
              <div>
                <strong>{partner.name}</strong>
                <small>{formatPartnerMeta(partner)}</small>
              </div>
              <div>
                <strong>{partner.contact_name ?? "No contact assigned"}</strong>
                <small>{formatPartnerContact(partner)}</small>
              </div>
              <StatusBadge tone={statusTone(partner.status)}>{partner.status}</StatusBadge>
              <div>
                <strong>{partner.category ?? "General partner"}</strong>
                <small>{formatPartnerLocation(partner)}</small>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No partners found"
            description={
              hasPartnerFilters(filters)
                ? "No partners match the current query or status filter."
                : "No partner records are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

async function PricingRulesPanel({ filters, dataPromise }: PricingRulesPanelProps) {
  let response: B2bPaginatedResponse<B2bPricingRuleResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return (
      <Panel title="Pricing Rules Snapshot">
        <ErrorState
          title="Unable to load pricing rules"
          description={
            isApiError(error)
              ? `The B2B API responded with an error: ${error.message}`
              : "The B2B pricing rules API is currently unavailable. Try again in a moment."
          }
        />
      </Panel>
    );
  }

  if (response.items.length === 0) {
    return (
      <Panel meta="0 rules" title="Pricing Rules Snapshot">
        <EmptyState
          title="No pricing rules found"
          description={
            hasPartnerFilters(filters)
              ? "No pricing rules match the current query or status filter."
              : "No pricing rules are available yet."
          }
        />
      </Panel>
    );
  }

  const activeRulesCount = response.items.filter((rule) => rule.status.toLowerCase() === "active").length;

  return (
    <Panel
      meta={describePageWindow(response.page.limit, response.page.offset, response.page.total, "rules")}
      title="Pricing Rules Snapshot"
    >
      <div className="key-value-list">
        <div>
          <span>Visible rules</span>
          <strong>{response.items.length}</strong>
        </div>
        <div>
          <span>Active rules</span>
          <strong>{activeRulesCount}</strong>
        </div>
      </div>

      <div className="data-table compact-top">
        <div className="table-row table-head">
          <span>Rule</span>
          <span>Partner</span>
          <span>Rate</span>
          <span>Status</span>
        </div>
        {response.items.slice(0, 6).map((rule) => (
          <div className="table-row" key={rule.id}>
            <div>
              <strong>{rule.rule_name ?? rule.test_name ?? rule.test_code ?? "Untitled rule"}</strong>
              <small>{formatRuleMeta(rule)}</small>
            </div>
            <span>{rule.partner_id}</span>
            <span>{formatRulePricing(rule)}</span>
            <StatusBadge tone={statusTone(rule.status)}>{rule.status}</StatusBadge>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function hasPartnerFilters(filters: PartnerFilters): boolean {
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

  if (normalized === "active" || normalized === "enabled" || normalized === "approved") {
    return "good";
  }

  if (normalized === "pending" || normalized === "draft" || normalized === "queued") {
    return "warning";
  }

  if (normalized === "inactive" || normalized === "archived" || normalized === "suspended") {
    return "danger";
  }

  return "neutral";
}

function formatPartnerMeta(partner: B2bPartnerResource): string {
  const parts = [partner.partner_code, partner.id].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join(" | ") : partner.id;
}

function formatPartnerContact(partner: B2bPartnerResource): string {
  const parts = [partner.contact_email, partner.contact_phone].filter(
    (value): value is string => Boolean(value)
  );
  return parts.length > 0 ? parts.join(" | ") : "Contact details unavailable";
}

function formatPartnerLocation(partner: B2bPartnerResource): string {
  const parts = [partner.city, partner.state].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join(", ") : "Location not specified";
}

function formatRuleMeta(rule: B2bPricingRuleResource): string {
  const parts = [rule.price_list, rule.modality, rule.id].filter((value): value is string => Boolean(value));
  return parts.length > 0 ? parts.join(" | ") : rule.id;
}

function formatRulePricing(rule: B2bPricingRuleResource): string {
  if (typeof rule.amount === "number" && Number.isFinite(rule.amount)) {
    const currency = rule.currency?.trim();
    return `${currency && currency.length > 0 ? `${currency} ` : ""}${rule.amount.toFixed(2)}`;
  }

  if (typeof rule.discount_percent === "number" && Number.isFinite(rule.discount_percent)) {
    return `${rule.discount_percent.toFixed(2)}% discount`;
  }

  return "Not specified";
}

function describePageWindow(limit: number, offset: number, total: number, noun: string): string {
  if (total === 0) {
    return `0 ${noun}`;
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} ${noun}`;
}
