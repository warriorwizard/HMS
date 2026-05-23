# TAR-ARCH-02 - Auth, RBAC, and SaaS Tenancy

Status: In Progress
Type: Architecture Module Issue
Epic: `TAR-EPIC-02` Auth, RBAC, Tenancy
Priority: P0
Source: `../../docs/tarini-v6-architecture/02_AUTH_RBAC_TENANCY.md`

## Goal
Protect all clinical and operational data with tenant isolation, role-based permissions, secure sessions, and auditable access.

## Functional Scope
- Login, refresh, logout, and current-user APIs.
- Tenant selection and active tenant context.
- Roles, permissions, memberships, and site-level access.
- Permission helpers for backend routes and frontend navigation.
- Audit logging for sensitive actions.
- Cross-tenant isolation tests.

## Backing Tasks
- [x] `TAR-P1-001` Design database tables for tenants, sites, users, memberships, roles, permissions.
- [x] `TAR-P1-002` Implement tenant-aware request context middleware.
- [ ] `TAR-P1-003` Implement login, refresh, logout, and current-user APIs.
- [ ] `TAR-P1-004` Implement tenant selection flow.
- [ ] `TAR-P1-005` Implement permission checking helper.
- [ ] `TAR-P1-006` Implement audit log service and database table.
- [ ] `TAR-P1-007` Seed default roles and permissions.
- [ ] `TAR-P1-008` Build frontend login page.
- [ ] `TAR-P1-009` Build tenant selection page.
- [ ] `TAR-P1-010` Build role-aware app shell navigation.
- [ ] `TAR-P1-011` Add cross-tenant isolation tests.
- [ ] `TAR-P1-012` Add user management screen for Hospital Admin.

## Implementation Notes
- Never trust tenant ID from body data when authenticated context provides one.
- Every clinical query must be tenant scoped.
- Permission failures should be explicit and audit-worthy.
- Session revocation and refresh token rotation should be planned before production.

## Acceptance Checks
- A user can authenticate and retrieve current profile.
- A user can only access tenants where they have membership.
- Permission checks protect every sensitive route.
- Cross-tenant access attempts fail in tests.
- Audit logs capture login, logout, permission denial, role changes, and sensitive reads.

## LLM Handoff
```text
Read 02_AUTH_RBAC_TENANCY.md and BACKLOG.md Phase 1. Implement the next incomplete task only, starting with TAR-P1-003. Keep token, tenant, permission, and audit behavior covered by tests.
```
