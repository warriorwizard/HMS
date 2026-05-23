# Tarini V6 Status Board

Last updated: 2026-05-23

## In Progress
- None.

## Review
- `TAR-P0-006` - Add Docker Compose for Postgres and Redis. Runtime validation pending because Docker is unavailable in this environment.

## Blocked
- None.

## Next Up
- `TAR-P1-006` - Implement audit log service and database table.
- `TAR-P1-007` - Seed default roles and permissions.
- `TAR-P1-011` - Add cross-tenant isolation tests.

## Done
- `TAR-TRACK-001` - Create local project tracker.
- `TAR-TRACK-002` - Break architecture into implementation tasks.
- `TAR-TRACK-003` - Create architecture-to-backlog traceability matrix per architecture file.
- `TAR-TRACK-004` - Add Jira/Linear/CSV export format.
- `TAR-TRACK-005` - Create reusable LLM work-packet template.
- `TAR-TRACK-013` - Initialize GitHub execution workflow: pushed repository to `warriorwizard/HMS`, installed GitHub plugin for Codex, and seeded issues `#1` to `#10`.
- `TAR-FE-000` - Make initial sidebar navigation and module routes functional.
- `TAR-FE-001` - Add typed frontend API client with auth-aware request/error handling.
- `TAR-P0-001` - Create monorepo foundation and baseline folders.
- `TAR-P0-002` - Create backend FastAPI skeleton.
- `TAR-P0-003` - Create frontend Next.js skeleton.
- `TAR-P0-004` - Create shared environment configuration.
- `TAR-P0-005` - Add local development run instructions.
- `TAR-P0-007` - Add database migration tooling.
- `TAR-P0-008` - Add structured logging and request ID pattern.
- `TAR-P0-009` - Add first smoke tests.
- `TAR-P0-010` - Add CI placeholder workflow.
- `TAR-P1-001` - Design database tables for tenants, sites, users, memberships, roles, permissions.
- `TAR-P1-002` - Implement tenant-aware request context middleware.
- `TAR-P1-003` - Implement login, refresh, logout, and current-user APIs.
- `TAR-P1-004` - Implement tenant selection flow.
- `TAR-P1-005` - Implement permission checking helper.

## Current Sprint Goal
Complete the identity foundation required to protect clinical data:

- Auth APIs.
- Tenant selection.
- Permission checks.
- Audit logging.
- Cross-tenant isolation tests.
