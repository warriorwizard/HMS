import Link from "next/link";
import { Suspense } from "react";

import { AppShell } from "@/app/components/app-shell";
import {
  ActionBar,
  EmptyState,
  FieldHint,
  LoadingState,
  Panel,
  StatusBadge
} from "@/app/components/workspace-ui";
import type { AdminPaginatedResponse, AdminTenantResource } from "@/app/lib/api";
import { fetchAdminTenants, isApiError } from "@/app/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
}>;

type TenantFilters = {
  q: string;
  status: string;
};

type TenantDirectoryPanelProps = {
  filters: TenantFilters;
  dataPromise: Promise<AdminPaginatedResponse<AdminTenantResource>>;
};

export default async function AdminTenantsPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: TenantFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status)
  };
  const dataPromise = fetchAdminTenants({
    q: filters.q || undefined,
    status: filters.status || undefined
  });
  const hasFilters = filters.q.length > 0 || filters.status.length > 0;

  return (
    <AppShell activePath="/admin/tenants" eyebrow="Administration" title="Tenant Directory">
      <form action="/admin/tenants" className="toolbar">
        <label>
          <span>Search tenants</span>
          <input defaultValue={filters.q} name="q" placeholder="Tenant name, ID, or slug" type="search" />
          <FieldHint>Use a tenant name, slug, or identifier to narrow the directory.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="active or inactive" type="search" />
          <FieldHint>Filter by lifecycle status such as active, inactive, or suspended.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/admin/tenants">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="Tenant Directory">
              <LoadingState
                title="Loading tenants"
                description="Retrieving tenant directory and status summary from the admin API."
              />
            </Panel>
          }
        >
          <TenantDirectoryPanel dataPromise={dataPromise} filters={filters} />
        </Suspense>

        <Panel title="Quick Filters">
          <div className="key-value-list">
            <div>
              <span>Current query</span>
              <strong>{filters.q || "None"}</strong>
            </div>
            <div>
              <span>Current status</span>
              <strong>{filters.status || "All statuses"}</strong>
            </div>
          </div>
          <ActionBar>
            <Link className="button-link secondary" href={buildTenantFilterHref(filters.q, "active")}>
              Active
            </Link>
            <Link className="button-link secondary" href={buildTenantFilterHref(filters.q, "inactive")}>
              Inactive
            </Link>
            <Link className="button-link secondary" href={buildTenantFilterHref(filters.q, "suspended")}>
              Suspended
            </Link>
          </ActionBar>
        </Panel>
      </section>
    </AppShell>
  );
}

async function TenantDirectoryPanel({ filters, dataPromise }: TenantDirectoryPanelProps) {
  let response: AdminPaginatedResponse<AdminTenantResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return <TenantDirectoryFallback filters={filters} message={adminMessage(error)} />;
  }

  const recordsMeta = describePageWindow(response.page.limit, response.page.offset, response.page.total);

  return (
    <Panel className="wide-panel" meta={recordsMeta} title="Tenant Directory">
      <div className="data-table">
        <div className="table-row table-head">
          <span>Tenant</span>
          <span>Status</span>
          <span>Coverage</span>
          <span>Slug</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((tenant) => (
            <div className="table-row" key={tenant.id}>
              <div>
                <strong>{tenant.name}</strong>
                <small>{tenant.id}</small>
              </div>
              <StatusBadge tone={statusTone(tenant.status)}>{tenant.status}</StatusBadge>
              <span>{formatCoverage(tenant)}</span>
              <span>{tenant.slug}</span>
            </div>
          ))
        ) : (
          <EmptyState
            title="No tenants found"
            description={
              filters.q || filters.status
                ? "No tenants match the current filters. Try broadening the query or clearing status."
                : "No tenants are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

function TenantDirectoryFallback({
  filters,
  message
}: {
  filters: TenantFilters;
  message: string;
}) {
  const tenants = [
    {
      id: "TEN-PROXOHMS",
      name: "ProxoHMS Demo Center",
      slug: "proxohms-demo",
      status: "active",
      coverage: "3 sites | 8 departments | 124 memberships"
    },
    {
      id: "TEN-APEX",
      name: "Apex Hospitals Demo",
      slug: "apex-hospitals",
      status: "active",
      coverage: "5 sites | 11 departments | 286 memberships"
    },
    {
      id: "TEN-NOVA",
      name: "Nova Diagnostics Pilot",
      slug: "nova-diagnostics",
      status: "pending",
      coverage: "2 sites | 4 departments | 39 memberships"
    }
  ];
  const query = filters.q.toLowerCase();
  const status = filters.status.toLowerCase();
  const filteredTenants = tenants.filter((tenant) => {
    const matchesQuery =
      query.length === 0 ||
      [tenant.id, tenant.name, tenant.slug, tenant.coverage].join(" ").toLowerCase().includes(query);
    const matchesStatus = status.length === 0 || tenant.status.includes(status);
    return matchesQuery && matchesStatus;
  });

  return (
    <Panel className="wide-panel" meta={`${filteredTenants.length} tenants`} title="Tenant Directory">
      <FieldHint tone="warning">{message} Showing tenant administration snapshot.</FieldHint>
      <div className="data-table compact-top">
        <div className="table-row table-head">
          <span>Tenant</span>
          <span>Status</span>
          <span>Coverage</span>
          <span>Slug</span>
        </div>
        {filteredTenants.length > 0 ? (
          filteredTenants.map((tenant) => (
            <div className="table-row" key={tenant.id}>
              <div>
                <strong>{tenant.name}</strong>
                <small>{tenant.id}</small>
              </div>
              <StatusBadge tone={statusTone(tenant.status)}>{tenant.status}</StatusBadge>
              <span>{tenant.coverage}</span>
              <span>{tenant.slug}</span>
            </div>
          ))
        ) : (
          <EmptyState title="No tenants found" description="No demo tenants match the current filters." />
        )}
      </div>
    </Panel>
  );
}

function adminMessage(error: unknown): string {
  return isApiError(error)
    ? `The admin API responded with an error: ${error.message}.`
    : "The admin API is currently unavailable.";
}

function describePageWindow(limit: number, offset: number, total: number): string {
  if (total === 0) {
    return "0 tenants";
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} tenants`;
}

function buildTenantFilterHref(q: string, status: string): string {
  const params = new URLSearchParams();

  if (q.trim().length > 0) {
    params.set("q", q.trim());
  }
  params.set("status", status);

  return `/admin/tenants?${params.toString()}`;
}

function formatCoverage(tenant: AdminTenantResource): string {
  const siteCount = toNonNegativeNumber(tenant.site_count);
  const departmentCount = toNonNegativeNumber(tenant.department_count);
  const membershipCount = toNonNegativeNumber(tenant.membership_count);
  const chunks: string[] = [];

  if (siteCount !== null) {
    chunks.push(`${siteCount} sites`);
  }
  if (departmentCount !== null) {
    chunks.push(`${departmentCount} departments`);
  }
  if (membershipCount !== null) {
    chunks.push(`${membershipCount} memberships`);
  }

  return chunks.length > 0 ? chunks.join(" | ") : "No linked counts";
}

function readFilterValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0]?.trim() ?? "";
  }

  return value?.trim() ?? "";
}

function statusTone(status: string): "good" | "warning" | "danger" | "neutral" {
  const normalized = status.toLowerCase();

  if (normalized === "active" || normalized === "enabled") {
    return "good";
  }

  if (normalized === "inactive" || normalized === "pending" || normalized === "invited") {
    return "warning";
  }

  if (normalized === "suspended" || normalized === "disabled" || normalized === "archived") {
    return "danger";
  }

  return "neutral";
}

function toNonNegativeNumber(value: number | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.trunc(value);
}

