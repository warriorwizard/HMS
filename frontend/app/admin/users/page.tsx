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
import type { AdminMembershipResource, AdminPaginatedResponse } from "@/app/lib/api";
import { fetchAdminMemberships, isApiError } from "@/app/lib/api";

export const dynamic = "force-dynamic";

type PageSearchParams = Promise<{
  q?: string | string[] | undefined;
  status?: string | string[] | undefined;
  tenant_id?: string | string[] | undefined;
  role_key?: string | string[] | undefined;
}>;

type MembershipFilters = {
  q: string;
  status: string;
  tenant_id: string;
  role_key: string;
};

type MembershipDirectoryPanelProps = {
  filters: MembershipFilters;
  dataPromise: Promise<AdminPaginatedResponse<AdminMembershipResource>>;
};

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams?: PageSearchParams;
}) {
  const params = await searchParams;
  const filters: MembershipFilters = {
    q: readFilterValue(params?.q),
    status: readFilterValue(params?.status),
    tenant_id: readFilterValue(params?.tenant_id),
    role_key: readFilterValue(params?.role_key)
  };
  const dataPromise = fetchAdminMemberships({
    q: filters.q || undefined,
    status: filters.status || undefined,
    tenant_id: filters.tenant_id || undefined,
    role_key: filters.role_key || undefined
  });
  const hasFilters =
    filters.q.length > 0 ||
    filters.status.length > 0 ||
    filters.tenant_id.length > 0 ||
    filters.role_key.length > 0;

  return (
    <AppShell activePath="/admin/users" eyebrow="Administration" title="User Role Directory">
      <form action="/admin/users" className="toolbar">
        <label>
          <span>Search users</span>
          <input defaultValue={filters.q} name="q" placeholder="Name, email, or membership ID" type="search" />
          <FieldHint>Search across user, tenant, role, and membership fields.</FieldHint>
        </label>
        <label>
          <span>Status</span>
          <input defaultValue={filters.status} name="status" placeholder="active or inactive" type="search" />
          <FieldHint>Filter by membership status.</FieldHint>
        </label>
        <label>
          <span>Tenant ID</span>
          <input defaultValue={filters.tenant_id} name="tenant_id" placeholder="ten_..." type="search" />
          <FieldHint>Limit results to one tenant.</FieldHint>
        </label>
        <label>
          <span>Role key</span>
          <input defaultValue={filters.role_key} name="role_key" placeholder="doctor, nurse, admin" type="search" />
          <FieldHint>Filter by role key for operational audits.</FieldHint>
        </label>
        <button type="submit">Apply filters</button>
        {hasFilters ? (
          <Link className="button-link secondary" href="/admin/users">
            Clear
          </Link>
        ) : null}
      </form>

      <section className="wide-grid">
        <Suspense
          fallback={
            <Panel className="wide-panel" title="User Role Directory">
              <LoadingState
                title="Loading user memberships"
                description="Retrieving membership directory from the admin API."
              />
            </Panel>
          }
        >
          <MembershipDirectoryPanel dataPromise={dataPromise} filters={filters} />
        </Suspense>

        <Panel title="Quick Filters">
          <div className="key-value-list">
            <div>
              <span>Status</span>
              <strong>{filters.status || "All statuses"}</strong>
            </div>
            <div>
              <span>Tenant</span>
              <strong>{filters.tenant_id || "All tenants"}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{filters.role_key || "All roles"}</strong>
            </div>
          </div>
          <ActionBar>
            <Link
              className="button-link secondary"
              href={buildMembershipFilterHref({ ...filters, status: "active" })}
            >
              Active
            </Link>
            <Link
              className="button-link secondary"
              href={buildMembershipFilterHref({ ...filters, status: "inactive" })}
            >
              Inactive
            </Link>
            <Link className="button-link secondary" href={buildMembershipFilterHref(filters)}>
              Keep filters
            </Link>
          </ActionBar>
        </Panel>
      </section>
    </AppShell>
  );
}

async function MembershipDirectoryPanel({ filters, dataPromise }: MembershipDirectoryPanelProps) {
  let response: AdminPaginatedResponse<AdminMembershipResource>;

  try {
    response = await dataPromise;
  } catch (error) {
    return <MembershipDirectoryFallback filters={filters} message={adminMessage(error)} />;
  }

  const recordsMeta = describePageWindow(response.page.limit, response.page.offset, response.page.total);

  return (
    <Panel className="wide-panel" meta={recordsMeta} title="Membership Directory">
      <div className="data-table reports-table">
        <div className="table-row table-head">
          <span>User</span>
          <span>Tenant</span>
          <span>Role</span>
          <span>Permissions</span>
          <span>Status</span>
        </div>
        {response.items.length > 0 ? (
          response.items.map((membership) => {
            const permissionCount = readPermissionCount(membership);

            return (
              <div className="table-row" key={membership.id}>
                <div>
                  <strong>{formatUserLabel(membership)}</strong>
                  <small>{formatUserMeta(membership)}</small>
                </div>
                <div>
                  <strong>{formatTenantLabel(membership)}</strong>
                  <small>{formatTenantMeta(membership)}</small>
                </div>
                <div>
                  <strong>{formatRoleLabel(membership)}</strong>
                  <small>{formatRoleMeta(membership)}</small>
                </div>
                <span>{permissionCount}</span>
                <StatusBadge tone={statusTone(membership.status)}>{membership.status}</StatusBadge>
              </div>
            );
          })
        ) : (
          <EmptyState
            title="No memberships found"
            description={
              hasMembershipFilters(filters)
                ? "No user-role memberships match the current filters."
                : "No memberships are available yet."
            }
          />
        )}
      </div>
    </Panel>
  );
}

function MembershipDirectoryFallback({
  filters,
  message
}: {
  filters: MembershipFilters;
  message: string;
}) {
  const memberships = [
    {
      id: "MEM-DR-MEHRA",
      user: "Dr. Anika Mehra",
      email: "anika.mehra@proxohms.example",
      tenant: "ProxoHMS Demo Center",
      tenantId: "TEN-PROXOHMS",
      role: "Doctor",
      roleKey: "doctor",
      permissions: 18,
      status: "active"
    },
    {
      id: "MEM-LAB-DSOUZA",
      user: "M. Dsouza",
      email: "m.dsouza@proxohms.example",
      tenant: "ProxoHMS Demo Center",
      tenantId: "TEN-PROXOHMS",
      role: "Lab operations",
      roleKey: "technician",
      permissions: 11,
      status: "active"
    },
    {
      id: "MEM-CARE-KAUR",
      user: "P. Kaur",
      email: "p.kaur@proxohms.example",
      tenant: "Apex Hospitals Demo",
      tenantId: "TEN-APEX",
      role: "Care desk",
      roleKey: "staff",
      permissions: 9,
      status: "pending"
    }
  ];
  const query = filters.q.toLowerCase();
  const status = filters.status.toLowerCase();
  const tenantId = filters.tenant_id.toLowerCase();
  const roleKey = filters.role_key.toLowerCase();
  const filteredMemberships = memberships.filter((membership) => {
    const matchesQuery =
      query.length === 0 ||
      [
        membership.id,
        membership.user,
        membership.email,
        membership.tenant,
        membership.role,
        membership.roleKey
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesStatus = status.length === 0 || membership.status.includes(status);
    const matchesTenant = tenantId.length === 0 || membership.tenantId.toLowerCase().includes(tenantId);
    const matchesRole = roleKey.length === 0 || membership.roleKey.includes(roleKey);
    return matchesQuery && matchesStatus && matchesTenant && matchesRole;
  });

  return (
    <Panel className="wide-panel" meta={`${filteredMemberships.length} memberships`} title="Membership Directory">
      <FieldHint tone="warning">{message} Showing user-role administration snapshot.</FieldHint>
      <div className="data-table reports-table compact-top">
        <div className="table-row table-head">
          <span>User</span>
          <span>Tenant</span>
          <span>Role</span>
          <span>Permissions</span>
          <span>Status</span>
        </div>
        {filteredMemberships.length > 0 ? (
          filteredMemberships.map((membership) => (
            <div className="table-row" key={membership.id}>
              <div>
                <strong>{membership.user}</strong>
                <small>{membership.email} | {membership.id}</small>
              </div>
              <div>
                <strong>{membership.tenant}</strong>
                <small>{membership.tenantId}</small>
              </div>
              <div>
                <strong>{membership.role}</strong>
                <small>{membership.roleKey}</small>
              </div>
              <span>{membership.permissions}</span>
              <StatusBadge tone={statusTone(membership.status)}>{membership.status}</StatusBadge>
            </div>
          ))
        ) : (
          <EmptyState
            title="No memberships found"
            description="No demo memberships match the current admin filters."
          />
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

function buildMembershipFilterHref(filters: MembershipFilters): string {
  const params = new URLSearchParams();

  if (filters.q.trim().length > 0) {
    params.set("q", filters.q.trim());
  }
  if (filters.status.trim().length > 0) {
    params.set("status", filters.status.trim());
  }
  if (filters.tenant_id.trim().length > 0) {
    params.set("tenant_id", filters.tenant_id.trim());
  }
  if (filters.role_key.trim().length > 0) {
    params.set("role_key", filters.role_key.trim());
  }

  const queryString = params.toString();
  return queryString.length > 0 ? `/admin/users?${queryString}` : "/admin/users";
}

function formatUserLabel(membership: AdminMembershipResource): string {
  const fullName = [membership.user?.first_name ?? "", membership.user?.last_name ?? ""]
    .join(" ")
    .trim();

  if (fullName.length > 0) {
    return fullName;
  }

  return membership.user?.email ?? membership.user_id;
}

function formatUserMeta(membership: AdminMembershipResource): string {
  const parts = [membership.user?.email, membership.user?.id ?? membership.user_id].filter(
    (value): value is string => Boolean(value)
  );

  return parts.length > 0 ? parts.join(" | ") : membership.id;
}

function formatTenantLabel(membership: AdminMembershipResource): string {
  return membership.tenant?.name ?? membership.tenant_id;
}

function formatTenantMeta(membership: AdminMembershipResource): string {
  const parts = [membership.tenant?.slug, membership.tenant?.id ?? membership.tenant_id].filter(
    (value): value is string => Boolean(value)
  );

  return parts.length > 0 ? parts.join(" | ") : "Tenant details unavailable";
}

function formatRoleLabel(membership: AdminMembershipResource): string {
  return membership.role?.name ?? membership.role?.key ?? membership.role_id;
}

function formatRoleMeta(membership: AdminMembershipResource): string {
  const parts = [membership.role?.key, membership.role?.id ?? membership.role_id].filter(
    (value): value is string => Boolean(value)
  );

  return parts.length > 0 ? parts.join(" | ") : "Role details unavailable";
}

function readPermissionCount(membership: AdminMembershipResource): number {
  if (typeof membership.permission_count === "number" && Number.isFinite(membership.permission_count)) {
    return Math.max(0, Math.trunc(membership.permission_count));
  }

  if (
    typeof membership.role?.permission_count === "number" &&
    Number.isFinite(membership.role.permission_count)
  ) {
    return Math.max(0, Math.trunc(membership.role.permission_count));
  }

  return 0;
}

function hasMembershipFilters(filters: MembershipFilters): boolean {
  return (
    filters.q.length > 0 ||
    filters.status.length > 0 ||
    filters.tenant_id.length > 0 ||
    filters.role_key.length > 0
  );
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

function describePageWindow(limit: number, offset: number, total: number): string {
  if (total === 0) {
    return "0 memberships";
  }

  const from = Math.min(total, offset + 1);
  const to = Math.min(total, offset + limit);
  return `${from}-${to} of ${total} memberships`;
}

