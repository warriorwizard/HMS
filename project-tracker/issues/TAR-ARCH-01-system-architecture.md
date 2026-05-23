# TAR-ARCH-01 - System Architecture

Status: In Progress
Type: Architecture Module Issue
Epic: `TAR-EPIC-01` Platform Foundation
Priority: P0
Source: `../../docs/tarini-v6-architecture/01_SYSTEM_ARCHITECTURE.md`

## Goal
Create the production foundation for Tarini V6: modular frontend, FastAPI backend, PostgreSQL, vector storage readiness, Redis, storage abstraction, observability, and deployable environments.

## Functional Scope
- Backend application shell with health checks, settings, middleware, and route organization.
- Frontend application shell with role-aware navigation and clinical workspace structure.
- Database and cache foundation.
- Event and observability patterns.
- Environment separation for local, staging, pilot, and production.

## Backing Tasks
- [x] `TAR-P0-001` Create monorepo foundation and baseline folders.
- [x] `TAR-P0-002` Create backend FastAPI skeleton.
- [x] `TAR-P0-003` Create frontend Next.js skeleton.
- [x] `TAR-P0-004` Create shared environment configuration.
- [x] `TAR-P0-005` Add local development run instructions.
- [ ] `TAR-P0-006` Add Docker Compose for Postgres and Redis. Current status in backlog: `[Review]`.
- [x] `TAR-P0-007` Add database migration tooling.
- [x] `TAR-P0-008` Add structured logging and request ID pattern.
- [x] `TAR-P0-009` Add first smoke tests.
- [x] `TAR-P0-010` Add CI placeholder workflow.

## Implementation Notes
- Keep service boundaries modular even while code is in one repository.
- Avoid coupling clinical AI directly to upload or patient write paths.
- Every request should carry request ID, correlation ID, user context, and tenant context when available.
- Operational metrics should be designed before dashboards depend on them.

## Acceptance Checks
- Local frontend and backend can run independently.
- Health endpoint proves app boot, request IDs, and structured logging.
- Database migrations are repeatable.
- CI can run lint and smoke tests.
- Runtime infrastructure is documented, with Docker validation completed when Docker is available.

## LLM Handoff
```text
Read 01_SYSTEM_ARCHITECTURE.md and BACKLOG.md Phase 0. Work only on the next incomplete Phase 0 or shared-platform task. Do not introduce clinical features here. Update tracker files after verification.
```
