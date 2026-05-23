# Auth, RBAC, and SaaS Tenancy Architecture

## Product Purpose
This module controls identity, tenant membership, permissions, auditability, and secure access. It is the foundation for every other Tarini V6 module.

Healthcare data access must be role-aware, tenant-aware, and auditable. This module must be implemented before clinical data or AI features.

## Users and Roles
Primary roles:
- Super Admin: platform-level administrator.
- Hospital Admin: tenant administrator.
- Doctor: reviews cases, uses copilot, approves decisions.
- Technician: uploads reports/images, manages technical workflow.
- Staff: registration, billing, scheduling, follow-up support.
- Patient: views own reports, follow-ups, and selected communication.
- B2B Partner: limited access to linked referrals, order status, or reports.

## Permission Model
Use RBAC first, with optional policy-based permissions later.

Core permission resources:
- `tenant`
- `user`
- `patient`
- `visit`
- `report`
- `ai_analysis`
- `workflow_task`
- `billing`
- `analytics`
- `notification`
- `audit_log`

Core actions:
- `create`
- `read`
- `update`
- `delete`
- `approve`
- `assign`
- `escalate`
- `export`
- `comment`
- `override`

Permission format:
```text
resource.action
```

Examples:
- `patient.read`
- `report.upload`
- `ai_analysis.request`
- `ai_analysis.approve`
- `workflow_task.assign`
- `billing.update`
- `analytics.read`
- `audit_log.read`

## Tenant Model
Tenant represents a hospital, diagnostic center, lab network, or healthcare chain.

Tenant hierarchy should support:
- Single center tenant.
- Multi-center organization.
- Department-level access.
- Future white-label branding.
- Future B2B partner access.

Initial entities:
- `tenants`
- `tenant_sites`
- `departments`
- `users`
- `memberships`
- `roles`
- `permissions`
- `role_permissions`
- `user_sessions`
- `audit_logs`

## Tenant Isolation Rules
- Every patient-owned table must include `tenant_id`.
- Every visit, report, AI analysis, workflow, billing, notification, and audit record must include `tenant_id`.
- Backend must derive tenant context from authenticated membership.
- Never trust a frontend-provided `tenant_id` for authorization.
- Use database constraints and indexes on `tenant_id`.
- Consider PostgreSQL row-level security for production hardening.

## Authentication Flow
MVP:
1. User enters email and password.
2. Backend validates credentials.
3. Backend loads active memberships.
4. If user has multiple tenants, user selects tenant.
5. Backend issues tenant-scoped access token and refresh token.
6. Frontend stores token using secure storage strategy.
7. Every API call sends token.
8. Backend validates token and tenant membership.

Future:
- SAML/OIDC enterprise SSO.
- Magic link for patients.
- MFA for admins and doctors.
- Device trust and session risk scoring.

## Authorization Flow
For every protected endpoint:
1. Authenticate user.
2. Resolve active tenant.
3. Verify active membership.
4. Check role permission.
5. Apply record-level constraints.
6. Write audit log if sensitive.

Record-level constraints:
- Doctor can access cases assigned to them, their department, or queue permissions.
- Technician can access upload and processing views but not all analytics.
- Staff can access registration and billing but not AI internals unless granted.
- Patient can access only their own approved data.
- B2B partner can access only linked orders or referrals.

## API Endpoints
Recommended endpoints:
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /auth/me`
- `GET /auth/tenants`
- `POST /auth/select-tenant`
- `GET /users`
- `POST /users`
- `PATCH /users/{user_id}`
- `GET /roles`
- `POST /roles`
- `PATCH /roles/{role_id}`
- `GET /permissions`
- `POST /memberships`
- `PATCH /memberships/{membership_id}`

## Request Context Object
Backend should expose a standard request context:
```json
{
  "request_id": "req_...",
  "correlation_id": "corr_...",
  "actor_id": "usr_...",
  "tenant_id": "ten_...",
  "site_id": "site_...",
  "role": "doctor",
  "permissions": ["patient.read", "report.read"],
  "ip_address": "redacted-or-hashed",
  "user_agent": "..."
}
```

## Audit Logging
Audit log required for:
- Login failure and success.
- Tenant switching.
- User creation or role change.
- Patient create/update/merge.
- Report upload/view/download/delete.
- AI analysis request/view/override.
- Billing update.
- Export.
- Permission denied events for sensitive resources.

Audit fields:
- `id`
- `tenant_id`
- `actor_id`
- `actor_role`
- `action`
- `resource_type`
- `resource_id`
- `before_hash`
- `after_hash`
- `metadata`
- `ip_hash`
- `created_at`

## Security Requirements
- Passwords must use strong salted hashing.
- Tokens must expire.
- Refresh tokens must be revocable.
- Failed login attempts must be rate-limited.
- Admin actions must be auditable.
- Permission changes should require elevated permission.
- Patient-facing access should expose only approved and released content.

## Failure and Edge Cases
- User belongs to no tenant: show access pending state.
- User belongs to multiple tenants: require tenant selection.
- Role changed during session: force permission refresh.
- Tenant disabled: block access immediately.
- Password reset requested by unknown email: return generic success.
- Patient tries to access unreleased report: return permission-safe message.

## Implementation Tasks
- Build database models for users, tenants, memberships, roles, permissions.
- Implement auth middleware.
- Implement permission dependency helper.
- Implement tenant-scoped repository base.
- Implement audit service.
- Seed default roles and permissions.
- Add tests for cross-tenant isolation.
- Add frontend role-aware layout routing.

## Acceptance Criteria
- Users cannot access another tenant's patient records by changing IDs.
- Role changes affect API access.
- Every sensitive action creates an audit log.
- Super Admin can manage tenants but cannot casually view PHI without explicit break-glass policy.
- Hospital Admin can manage users in their own tenant only.
- Patient role can view only their own approved records.

## LLM Implementation Notes
When asking an LLM to implement this module, include:
- This file.
- Current backend structure.
- Current auth library choice if one exists.
- Existing database migration tooling.

Tell the LLM to implement auth and tenant middleware before any clinical module, because every downstream query depends on it.

