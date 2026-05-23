# Tarini V6 Implementation Backlog

Last updated: 2026-05-22

## Status Legend
- `[Todo]`: ready to start.
- `[In Progress]`: active work.
- `[Review]`: implementation complete, needs verification.
- `[Blocked]`: waiting on dependency.
- `[Done]`: complete and verified.

## Tracker Setup
- `[Done]` `TAR-TRACK-001` `P0` Create local tracker folder and status board. Output: `project-tracker`.
- `[Done]` `TAR-TRACK-002` `P0` Break architecture into implementation tasks. Output: this backlog.

## Frontend Usability Fixes
- `[Done]` `TAR-FE-000` `P0` Make initial sidebar navigation and module routes functional. Output: `/doctor/command-center`, `/patients`, `/reports`, `/workflow`, `/analytics`, `/settings`; `/` redirects to command center.

## Phase 0: Engineering Foundation
- `[Done]` `TAR-P0-001` `P0` Create monorepo foundation and baseline folders. Depends: none. Output: `frontend`, `backend`, `infra`, `packages`, `scripts`.
- `[Done]` `TAR-P0-002` `P0` Create backend FastAPI skeleton. Depends: `TAR-P0-001`. Output: app entrypoint, health endpoint, settings module.
- `[Done]` `TAR-P0-003` `P0` Create frontend Next.js skeleton. Depends: `TAR-P0-001`. Output: app shell, routes, package scripts.
- `[Done]` `TAR-P0-004` `P0` Create shared environment configuration. Depends: `TAR-P0-001`. Output: `.env.example`, config docs.
- `[Done]` `TAR-P0-005` `P0` Add local development run instructions. Depends: `TAR-P0-002`, `TAR-P0-003`. Output: root README.
- `[Review]` `TAR-P0-006` `P0` Add Docker Compose for Postgres and Redis. Depends: `TAR-P0-001`. Output: `infra/local/docker-compose.yml`. Note: Docker unavailable locally, runtime validation pending.
- `[Done]` `TAR-P0-007` `P0` Add database migration tooling. Depends: `TAR-P0-002`, `TAR-P0-006`. Output: Alembic or equivalent migration baseline.
- `[Done]` `TAR-P0-008` `P1` Add structured logging and request ID pattern. Depends: `TAR-P0-002`. Output: backend logging middleware.
- `[Done]` `TAR-P0-009` `P1` Add first smoke tests. Depends: `TAR-P0-002`, `TAR-P0-003`. Output: backend health test and frontend render test.
- `[Done]` `TAR-P0-010` `P1` Add CI placeholder workflow. Depends: `TAR-P0-009`. Output: lint/test workflow config.

## Phase 1: Auth, RBAC, Tenancy, Audit
- `[Done]` `TAR-P1-001` `P0` Design database tables for tenants, sites, users, memberships, roles, permissions. Depends: `TAR-P0-007`.
- `[Done]` `TAR-P1-002` `P0` Implement tenant-aware request context middleware. Depends: `TAR-P1-001`.
- `[Done]` `TAR-P1-003` `P0` Implement login, refresh, logout, and current-user APIs. Depends: `TAR-P1-001`.
- `[Done]` `TAR-P1-004` `P0` Implement tenant selection flow. Depends: `TAR-P1-003`.
- `[Done]` `TAR-P1-005` `P0` Implement permission checking helper. Depends: `TAR-P1-001`.
- `[Todo]` `TAR-P1-006` `P0` Implement audit log service and database table. Depends: `TAR-P1-001`.
- `[Todo]` `TAR-P1-007` `P0` Seed default roles and permissions. Depends: `TAR-P1-001`.
- `[Todo]` `TAR-P1-008` `P1` Build frontend login page. Depends: `TAR-P0-003`, `TAR-P1-003`.
- `[Todo]` `TAR-P1-009` `P1` Build tenant selection page. Depends: `TAR-P1-004`.
- `[Todo]` `TAR-P1-010` `P1` Build role-aware app shell navigation. Depends: `TAR-P1-005`.
- `[Todo]` `TAR-P1-011` `P0` Add cross-tenant isolation tests. Depends: `TAR-P1-002`, `TAR-P1-005`.
- `[Todo]` `TAR-P1-012` `P1` Add user management screen for Hospital Admin. Depends: `TAR-P1-003`, `TAR-P1-005`.

## Phase 2: Patient and Visit Management
- `[Todo]` `TAR-P2-001` `P0` Create patient, identifiers, consent, visit, timeline tables. Depends: `TAR-P1-002`.
- `[Todo]` `TAR-P2-002` `P0` Implement patient create/read/update APIs. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-003` `P0` Implement patient search API. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-004` `P1` Implement duplicate detection service. Depends: `TAR-P2-003`.
- `[Todo]` `TAR-P2-005` `P0` Implement visit creation API. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-006` `P0` Implement visit state machine. Depends: `TAR-P2-005`.
- `[Todo]` `TAR-P2-007` `P1` Implement consent capture API. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-008` `P1` Implement patient timeline writer. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-009` `P1` Build patient search UI. Depends: `TAR-P2-003`.
- `[Todo]` `TAR-P2-010` `P1` Build patient registration UI. Depends: `TAR-P2-002`.
- `[Todo]` `TAR-P2-011` `P1` Build patient profile and timeline UI. Depends: `TAR-P2-008`.
- `[Todo]` `TAR-P2-012` `P1` Add patient/visit tenant isolation tests. Depends: `TAR-P2-002`, `TAR-P2-005`.

## Phase 3: Reports and Imaging Pipeline
- `[Todo]` `TAR-P3-001` `P0` Create report, file, metadata, processing-job tables. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P3-002` `P0` Implement object storage abstraction. Depends: `TAR-P0-004`.
- `[Todo]` `TAR-P3-003` `P0` Implement secure report upload API. Depends: `TAR-P3-001`, `TAR-P3-002`.
- `[Todo]` `TAR-P3-004` `P1` Implement signed file URL API. Depends: `TAR-P3-002`.
- `[Todo]` `TAR-P3-005` `P1` Implement report status lifecycle. Depends: `TAR-P3-001`.
- `[Todo]` `TAR-P3-006` `P1` Implement PDF text extraction job. Depends: `TAR-P3-003`.
- `[Todo]` `TAR-P3-007` `P1` Implement metadata extraction result storage. Depends: `TAR-P3-006`.
- `[Todo]` `TAR-P3-008` `P1` Implement duplicate file checksum warning. Depends: `TAR-P3-003`.
- `[Todo]` `TAR-P3-009` `P1` Build technician upload UI. Depends: `TAR-P3-003`.
- `[Todo]` `TAR-P3-010` `P1` Build report viewer UI. Depends: `TAR-P3-004`.
- `[Todo]` `TAR-P3-011` `P1` Add report processing worker tests. Depends: `TAR-P3-006`.

## Phase 4: Workflow, Tasks, Escalations, Notifications
- `[Todo]` `TAR-P4-001` `P0` Create workflow, task, transition, notification tables. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P4-002` `P0` Implement workflow state machine service. Depends: `TAR-P4-001`.
- `[Todo]` `TAR-P4-003` `P0` Implement task creation and assignment APIs. Depends: `TAR-P4-001`.
- `[Todo]` `TAR-P4-004` `P1` Implement SLA evaluator worker. Depends: `TAR-P4-003`.
- `[Todo]` `TAR-P4-005` `P1` Implement escalation rule evaluator. Depends: `TAR-P4-004`.
- `[Todo]` `TAR-P4-006` `P1` Implement in-app notification service. Depends: `TAR-P4-001`.
- `[Todo]` `TAR-P4-007` `P1` Build worklist UI. Depends: `TAR-P4-003`.
- `[Todo]` `TAR-P4-008` `P1` Build notification center UI. Depends: `TAR-P4-006`.
- `[Todo]` `TAR-P4-009` `P1` Add workflow transition tests. Depends: `TAR-P4-002`.

## Phase 5: Clinical Memory Engine
- `[Todo]` `TAR-P5-001` `P0` Create memory item, embedding, retrieval log tables. Depends: `TAR-P3-001`.
- `[Todo]` `TAR-P5-002` `P0` Implement report-to-memory ingestion service. Depends: `TAR-P3-007`, `TAR-P5-001`.
- `[Todo]` `TAR-P5-003` `P1` Implement text chunking strategy. Depends: `TAR-P5-002`.
- `[Todo]` `TAR-P5-004` `P1` Implement embedding generation interface. Depends: `TAR-P5-003`.
- `[Todo]` `TAR-P5-005` `P1` Implement patient context retrieval API. Depends: `TAR-P5-001`.
- `[Todo]` `TAR-P5-006` `P1` Implement similar case retrieval API. Depends: `TAR-P5-004`.
- `[Todo]` `TAR-P5-007` `P1` Add source reference formatting. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-P5-008` `P1` Build memory/context UI panel. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-P5-009` `P1` Add retrieval audit tests. Depends: `TAR-P5-005`.

## Phase 6: Risk and Prediction Engine
- `[Todo]` `TAR-P6-001` `P0` Create risk assessment, factor, priority queue tables. Depends: `TAR-P5-001`.
- `[Todo]` `TAR-P6-002` `P0` Implement rule-based risk scoring service. Depends: `TAR-P6-001`.
- `[Todo]` `TAR-P6-003` `P1` Implement configurable risk thresholds. Depends: `TAR-P6-002`.
- `[Todo]` `TAR-P6-004` `P1` Implement priority queue update logic. Depends: `TAR-P6-002`.
- `[Todo]` `TAR-P6-005` `P1` Implement risk history API. Depends: `TAR-P6-001`.
- `[Todo]` `TAR-P6-006` `P1` Implement doctor override API. Depends: `TAR-P6-004`.
- `[Todo]` `TAR-P6-007` `P1` Build risk explanation UI. Depends: `TAR-P6-005`.
- `[Todo]` `TAR-P6-008` `P1` Add unknown-data and override tests. Depends: `TAR-P6-006`.

## Phase 7: Doctor Command Center
- `[Todo]` `TAR-P7-001` `P0` Create doctor queue, review, comment, escalation tables. Depends: `TAR-P6-001`, `TAR-P4-001`.
- `[Todo]` `TAR-P7-002` `P0` Implement command center queue API. Depends: `TAR-P7-001`.
- `[Todo]` `TAR-P7-003` `P0` Implement case workspace API. Depends: `TAR-P7-002`, `TAR-P5-005`.
- `[Todo]` `TAR-P7-004` `P1` Implement start review and claim flow. Depends: `TAR-P7-002`.
- `[Todo]` `TAR-P7-005` `P1` Implement complete review flow. Depends: `TAR-P7-004`.
- `[Todo]` `TAR-P7-006` `P1` Implement case comments. Depends: `TAR-P7-001`.
- `[Todo]` `TAR-P7-007` `P1` Implement case escalation. Depends: `TAR-P7-001`, `TAR-P4-003`.
- `[Todo]` `TAR-P7-008` `P1` Build command center queue UI. Depends: `TAR-P7-002`.
- `[Todo]` `TAR-P7-009` `P1` Build case workspace UI. Depends: `TAR-P7-003`.
- `[Todo]` `TAR-P7-010` `P1` Add queue sorting and permission tests. Depends: `TAR-P7-002`.

## Phase 8: Clinical Copilot
- `[Todo]` `TAR-P8-001` `P0` Create copilot conversation, message, artifact tables. Depends: `TAR-P5-001`.
- `[Todo]` `TAR-P8-002` `P0` Implement copilot mode classifier. Depends: `TAR-P8-001`.
- `[Todo]` `TAR-P8-003` `P0` Implement retrieval-grounded answer service. Depends: `TAR-P5-005`, `TAR-P8-002`.
- `[Todo]` `TAR-P8-004` `P1` Implement report summary endpoint. Depends: `TAR-P8-003`.
- `[Todo]` `TAR-P8-005` `P1` Implement risk explanation endpoint. Depends: `TAR-P6-005`, `TAR-P8-003`.
- `[Todo]` `TAR-P8-006` `P1` Implement note draft artifact flow. Depends: `TAR-P8-001`.
- `[Todo]` `TAR-P8-007` `P1` Implement copilot safety and citation validation. Depends: `TAR-P8-003`.
- `[Todo]` `TAR-P8-008` `P1` Build copilot panel UI. Depends: `TAR-P8-003`.
- `[Todo]` `TAR-P8-009` `P1` Add copilot feedback capture. Depends: `TAR-P8-001`.
- `[Todo]` `TAR-P8-010` `P1` Add prompt injection and missing-context tests. Depends: `TAR-P8-007`.

## Phase 9: Digital Patient Twin
- `[Todo]` `TAR-P9-001` `P1` Create patient twin, snapshot, intervention tables. Depends: `TAR-P6-001`.
- `[Todo]` `TAR-P9-002` `P1` Implement twin snapshot creation from risk assessment. Depends: `TAR-P9-001`.
- `[Todo]` `TAR-P9-003` `P1` Implement progression comparison logic. Depends: `TAR-P9-002`.
- `[Todo]` `TAR-P9-004` `P1` Implement patient twin API. Depends: `TAR-P9-002`.
- `[Todo]` `TAR-P9-005` `P2` Implement intervention history API. Depends: `TAR-P9-001`.
- `[Todo]` `TAR-P9-006` `P2` Build digital twin UI panel. Depends: `TAR-P9-004`.
- `[Todo]` `TAR-P9-007` `P2` Add low-confidence and missing-data tests. Depends: `TAR-P9-004`.

## Phase 10: Billing Layer
- `[Todo]` `TAR-P10-001` `P1` Create service catalog, invoice, line item, payment, adjustment tables. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P10-002` `P1` Implement service catalog APIs. Depends: `TAR-P10-001`.
- `[Todo]` `TAR-P10-003` `P1` Implement invoice creation API. Depends: `TAR-P10-001`.
- `[Todo]` `TAR-P10-004` `P1` Implement invoice totals calculation service. Depends: `TAR-P10-003`.
- `[Todo]` `TAR-P10-005` `P1` Implement payment recording API. Depends: `TAR-P10-003`.
- `[Todo]` `TAR-P10-006` `P1` Integrate billing status with workflow. Depends: `TAR-P4-002`, `TAR-P10-005`.
- `[Todo]` `TAR-P10-007` `P2` Build billing desk UI. Depends: `TAR-P10-003`.
- `[Todo]` `TAR-P10-008` `P2` Add billing permission and totals tests. Depends: `TAR-P10-005`.

## Phase 11: Analytics and Executive Dashboard
- `[Todo]` `TAR-P11-001` `P1` Create analytics events and metric snapshot tables. Depends: `TAR-P4-001`.
- `[Todo]` `TAR-P11-002` `P1` Implement analytics event writer. Depends: `TAR-P11-001`.
- `[Todo]` `TAR-P11-003` `P1` Implement operational overview metrics. Depends: `TAR-P11-002`.
- `[Todo]` `TAR-P11-004` `P1` Implement SLA metrics. Depends: `TAR-P4-004`, `TAR-P11-002`.
- `[Todo]` `TAR-P11-005` `P2` Implement AI usage metrics. Depends: `TAR-P8-001`, `TAR-P11-002`.
- `[Todo]` `TAR-P11-006` `P2` Implement billing metrics. Depends: `TAR-P10-005`, `TAR-P11-002`.
- `[Todo]` `TAR-P11-007` `P2` Build analytics dashboard UI. Depends: `TAR-P11-003`.
- `[Todo]` `TAR-P11-008` `P2` Build executive dashboard UI. Depends: `TAR-P11-003`, `TAR-P11-004`.
- `[Todo]` `TAR-P11-009` `P2` Implement executive alerts. Depends: `TAR-P11-004`.
- `[Todo]` `TAR-P11-010` `P2` Add analytics permission and aggregation tests. Depends: `TAR-P11-003`.

## Phase 12: Population Intelligence
- `[Todo]` `TAR-P12-001` `P2` Create cohort and population metric tables. Depends: `TAR-P11-001`.
- `[Todo]` `TAR-P12-002` `P2` Implement cohort definition schema. Depends: `TAR-P12-001`.
- `[Todo]` `TAR-P12-003` `P2` Implement small cohort suppression. Depends: `TAR-P12-002`.
- `[Todo]` `TAR-P12-004` `P2` Implement population overview metrics. Depends: `TAR-P12-003`.
- `[Todo]` `TAR-P12-005` `P3` Implement risk cluster detection MVP. Depends: `TAR-P12-004`.
- `[Todo]` `TAR-P12-006` `P3` Build population intelligence UI. Depends: `TAR-P12-004`.
- `[Todo]` `TAR-P12-007` `P2` Add de-identification and suppression tests. Depends: `TAR-P12-003`.

## Phase 13: MLOps and Learning Loop
- `[Todo]` `TAR-P13-001` `P2` Create model registry and prompt registry tables. Depends: `TAR-P8-001`.
- `[Todo]` `TAR-P13-002` `P2` Store model and prompt version on AI outputs. Depends: `TAR-P13-001`.
- `[Todo]` `TAR-P13-003` `P2` Create feedback and outcome tables. Depends: `TAR-P8-009`.
- `[Todo]` `TAR-P13-004` `P2` Implement feedback capture API. Depends: `TAR-P13-003`.
- `[Todo]` `TAR-P13-005` `P2` Implement outcome capture API. Depends: `TAR-P13-003`.
- `[Todo]` `TAR-P13-006` `P3` Implement drift monitoring baseline. Depends: `TAR-P13-004`, `TAR-P13-005`.
- `[Todo]` `TAR-P13-007` `P3` Implement shadow-mode model selection. Depends: `TAR-P13-001`.
- `[Todo]` `TAR-P13-008` `P3` Build MLOps governance UI. Depends: `TAR-P13-001`.

## Phase 14: Security, Compliance, Production Hardening
- `[Todo]` `TAR-P14-001` `P0` Add PHI-safe logging rules. Depends: `TAR-P0-008`.
- `[Todo]` `TAR-P14-002` `P0` Add signed URL expiration policy. Depends: `TAR-P3-004`.
- `[Todo]` `TAR-P14-003` `P0` Add rate limiting for auth and sensitive endpoints. Depends: `TAR-P1-003`.
- `[Todo]` `TAR-P14-004` `P1` Add backup and restore documentation. Depends: `TAR-P0-006`.
- `[Todo]` `TAR-P14-005` `P1` Add release readiness checklist. Depends: MVP modules.
- `[Todo]` `TAR-P14-006` `P1` Add production incident response runbook. Depends: `TAR-P14-005`.
- `[Todo]` `TAR-P14-007` `P1` Add audit coverage review. Depends: `TAR-P1-006`.
- `[Todo]` `TAR-P14-008` `P1` Add clinical safety review checklist. Depends: `TAR-P6-002`, `TAR-P8-007`.

## MVP Definition
MVP is complete when these are done:

- Phase 0 complete.
- Phase 1 complete.
- Phase 2 complete.
- Phase 3 core upload path complete.
- Phase 4 workflow/task path complete.
- Phase 5 basic memory retrieval complete.
- Phase 6 rule-based risk and priority queue complete.
- Phase 7 command center complete.
- Phase 8 basic copilot summary and citations complete.
- Phase 11 basic analytics complete.
- Phase 14 production safety checklist complete.
