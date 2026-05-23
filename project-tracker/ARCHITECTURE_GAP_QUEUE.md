# Tarini V6 Architecture Gap Queue

Last updated: 2026-05-22

## Purpose
This file captures additional Jira-style issues extracted from the architecture pack after the initial backlog was created. These are more granular implementation tasks that prevent vague work items and help future LLM/engineering runs stay focused.

## Highest Priority Foundation Gaps
- `[Todo]` `TAR-P0-011` `API Platform` `P0` Standard API error, pagination, timestamp, and response contracts. Depends: `TAR-P0-002`.
- `[Todo]` `TAR-P0-012` `Events` `P0` Event envelope, publisher abstraction, outbox table, and idempotency keys. Depends: `TAR-P0-007`.
- `[Todo]` `TAR-P0-013` `Workers` `P0` Background worker framework with retry, status, dead-letter, and correlation IDs. Depends: `TAR-P0-006`.
- `[Todo]` `TAR-P1-013` `Tenancy` `P0` Tenant-scoped repository base/helper that forces tenant filters. Depends: `TAR-P1-002`.
- `[Done]` `TAR-FE-001` `Frontend Platform` `P0` Typed API client with auth refresh, 401/403 handling, cancellation, and error normalization. Depends: `TAR-P0-003`.
- `[Todo]` `TAR-AI-001` `AI Orchestration` `P0` Create `ai_tasks`, `ai_agent_runs`, and `ai_policies` schema. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-AI-003` `AI Safety` `P0` Output schema validation, repair/reject path, and safety flags. Depends: `TAR-AI-002`.
- `[Todo]` `TAR-P3-012` `Security` `P0` File safety/virus scanning job before AI readiness. Depends: `TAR-P3-003`.

## Tracker and Planning
- `[Done]` `TAR-TRACK-003` `Planning` `P0` Create architecture-to-backlog traceability matrix per architecture file. Depends: `TAR-TRACK-002`.
- `[Done]` `TAR-TRACK-004` `Planning` `P1` Add Jira/Linear/CSV export format with issue title, component, priority, dependencies, acceptance criteria. Depends: `TAR-TRACK-003`.
- `[Done]` `TAR-TRACK-005` `Planning` `P1` Create reusable LLM work-packet template per issue with required architecture files and safety constraints. Depends: `TAR-TRACK-003`.

## Platform, API, Events, Workers
- `[Todo]` `TAR-P0-014` `Demo Data` `P1` Seed synthetic demo tenant, users, patients, visits, reports, and queue cases. Depends: `TAR-P1-007`.
- `[Todo]` `TAR-P0-015` `Data Contracts` `P0` Shared event, audit, pagination, and API error DTOs. Depends: `TAR-P0-007`.
- `[Todo]` `TAR-P0-016` `Database` `P1` ID strategy decision and helper for prefixed IDs or UUID consistency. Depends: `TAR-P0-007`.
- `[Todo]` `TAR-P0-017` `Database` `P1` Tenant-owned table index checklist and migration review gate. Depends: `TAR-P1-001`.
- `[Todo]` `TAR-P0-018` `Data Governance` `P1` Retention, archival, soft-delete fields, and immutable audit policy. Depends: `TAR-P1-006`.

## Auth, RBAC, Tenancy
- `[Todo]` `TAR-P1-014` `Auth` `P0` Refresh-token revocation, role-change session invalidation, and disabled-tenant lockout. Depends: `TAR-P1-003`.
- `[Todo]` `TAR-P1-015` `Security` `P0` Password hashing policy, password reset flow, and generic unknown-email response. Depends: `TAR-P1-003`.
- `[Todo]` `TAR-P1-016` `Admin` `P1` Role/permission management API and UI, separate from user management. Depends: `TAR-P1-012`.
- `[Todo]` `TAR-P1-017` `Compliance` `P1` Super Admin break-glass PHI access policy with reason and audit. Depends: `TAR-P1-006`.

## Patient and Visit
- `[Todo]` `TAR-P2-013` `Patients` `P0` Duplicate merge request lifecycle API and review UI. Depends: `TAR-P2-004`.
- `[Todo]` `TAR-P2-014` `Patients` `P1` Patient identifier hashing, masked display, and external ID normalization. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-015` `Data Quality` `P1` Data-quality warnings for approximate age, missing phone, invalid DOB, and missing clinical fields. Depends: `TAR-P2-002`.
- `[Todo]` `TAR-P2-016` `Audit` `P1` Wrong-patient/wrong-visit correction flow with immutable audit trail. Depends: `TAR-P2-006`.

## Reports and Imaging
- `[Todo]` `TAR-P3-013` `Reports` `P1` OCR fallback for scanned PDFs and low-quality extracted text. Depends: `TAR-P3-006`.
- `[Todo]` `TAR-P3-014` `Reports` `P1` Extracted text storage contract separate from metadata. Depends: `TAR-P3-007`.
- `[Todo]` `TAR-P3-015` `Imaging` `P1` Thumbnail generation, image metadata capture, preview/zoom/pan viewer. Depends: `TAR-P3-003`.
- `[Todo]` `TAR-P3-016` `Reports` `P1` Human metadata review queue and retry failed processing action. Depends: `TAR-P3-005`.
- `[Todo]` `TAR-P3-017` `Reports` `P1` Report release flow and patient-only-released access enforcement. Depends: `TAR-P3-004`.

## Workflow and Notifications
- `[Todo]` `TAR-P4-010` `Workflow` `P0` Idempotent event-driven workflow transitions. Depends: `TAR-P4-002`.
- `[Todo]` `TAR-P4-011` `Workflow` `P1` Role queues and inactive-user reassignment. Depends: `TAR-P4-003`.
- `[Todo]` `TAR-P4-012` `Notifications` `P1` Email notification adapter with retry/failure status. Depends: `TAR-P4-006`.
- `[Todo]` `TAR-P4-013` `Workflow` `P1` Manual workflow override with reason and audit. Depends: `TAR-P4-002`.
- `[Todo]` `TAR-P4-014` `Follow-up` `P1` Follow-up board, reminder attempts, consent-aware patient notification block. Depends: `TAR-P4-003`.

## Clinical Memory
- `[Todo]` `TAR-P5-010` `Memory` `P0` pgvector/vector index setup and metadata-filtered retrieval indexes. Depends: `TAR-P5-001`.
- `[Todo]` `TAR-P5-011` `Memory` `P1` Idempotent ingest by `source_type + source_id`. Depends: `TAR-P5-002`.
- `[Todo]` `TAR-P5-012` `Security` `P1` Source visibility enforcement when reports are restricted, deleted, archived, or unreleased. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-P5-013` `Memory` `P1` Retrieval ranking policy using relevance, recency, source reliability, and sensitivity. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-P5-014` `Memory` `P2` Patient merge remapping for memory items and retrieval logs. Depends: `TAR-P2-013`.

## Risk and Prediction
- `[Todo]` `TAR-P6-009` `Risk` `P0` Data-quality assessment contract; insufficient data returns `unknown`, not low risk. Depends: `TAR-P6-002`.
- `[Todo]` `TAR-P6-010` `Risk` `P1` Risk method provenance: rules/model/hybrid, versions, and factor source refs. Depends: `TAR-P6-002`.
- `[Todo]` `TAR-P6-011` `Risk` `P1` Priority queue reconciliation/backfill worker. Depends: `TAR-P6-004`.
- `[Todo]` `TAR-P6-012` `Prediction` `P2` Operational risk scoring for SLA breach, review delay, and follow-up miss. Depends: `TAR-P4-004`.
- `[Todo]` `TAR-P6-013` `Validation` `P2` Clinical validation plan and labeled-data evaluation checklist before predictive claims. Depends: `TAR-P6-002`.

## Doctor Command Center
- `[Todo]` `TAR-P7-011` `Command Center` `P0` Active reviewer lock/claim conflict handling for two doctors opening same case. Depends: `TAR-P7-004`.
- `[Todo]` `TAR-P7-012` `Command Center` `P1` Urgent alerts strip and SLA timers in queue. Depends: `TAR-P7-002`.
- `[Todo]` `TAR-P7-013` `Command Center` `P1` Doctor decision type handling that creates follow-up/escalation/workflow events. Depends: `TAR-P7-005`.
- `[Todo]` `TAR-P7-014` `Command Center` `P1` Smart filters UI for risk, SLA, modality, site, department, doctor, warnings, and date. Depends: `TAR-P7-008`.
- `[Todo]` `TAR-P7-015` `Performance` `P2` Queue load/performance test for typical doctor queue. Depends: `TAR-P7-002`.

## Clinical Copilot and AI Safety
- `[Todo]` `TAR-P8-011` `Copilot` `P0` Prompt context builder with snippet budget and mode-specific source policy. Depends: `TAR-P8-003`.
- `[Todo]` `TAR-P8-012` `Copilot` `P1` Mode-specific authorization checks for patient, report, risk, note, and similar-case modes. Depends: `TAR-P8-002`.
- `[Todo]` `TAR-P8-013` `Copilot UI` `P1` Streaming/partial response, cancellation, retry, and model-failure UI states. Depends: `TAR-P8-008`.
- `[Todo]` `TAR-P8-014` `Copilot` `P1` Artifact approval converts draft note into auditable clinical note/timeline event. Depends: `TAR-P8-006`.
- `[Todo]` `TAR-P8-015` `AI Safety` `P1` Unsafe/out-of-scope request taxonomy and blocked-response audit. Depends: `TAR-P8-007`.
- `[Todo]` `TAR-AI-002` `AI Orchestration` `P0` Coordinator task router with task types, agent registry, retries, and cancellation. Depends: `TAR-AI-001`.
- `[Todo]` `TAR-AI-004` `AI Safety` `P0` Prompt-injection defense for uploaded documents and blocked tool-call policy. Depends: `TAR-AI-003`.
- `[Todo]` `TAR-AI-005` `AI Admin` `P2` AI policy management API and admin screen. Depends: `TAR-AI-001`.

## Digital Patient Twin
- `[Todo]` `TAR-P9-008` `Twin` `P1` Score formula/version contract with evidence refs and confidence reasons. Depends: `TAR-P9-002`.
- `[Todo]` `TAR-P9-009` `Twin` `P1` Current twin rollup updater after snapshot creation. Depends: `TAR-P9-002`.
- `[Todo]` `TAR-P9-010` `Twin` `P2` Recalculation failure handling, previous-snapshot preservation, and audit logs. Depends: `TAR-P9-004`.
- `[Todo]` `TAR-P9-011` `Twin` `P2` Intervention lifecycle statuses, approval rules, and completion events. Depends: `TAR-P9-005`.

## Billing
- `[Todo]` `TAR-P10-009` `Billing` `P0` Tenant-scoped invoice number generation. Depends: `TAR-P10-001`.
- `[Todo]` `TAR-P10-010` `Billing` `P1` Invoice issue, void, refund, write-off APIs and status transitions. Depends: `TAR-P10-003`.
- `[Todo]` `TAR-P10-011` `Billing` `P1` Discount and adjustment approval limits. Depends: `TAR-P10-004`.
- `[Todo]` `TAR-P10-012` `Billing` `P1` Partial payment, overpayment, and partner credit handling. Depends: `TAR-P10-005`.
- `[Todo]` `TAR-P10-013` `Billing UI` `P2` Visit invoice panel and receipt/export action. Depends: `TAR-P10-003`.

## Analytics, Executive, Population
- `[Todo]` `TAR-P11-011` `Analytics` `P1` Aggregation worker and metric snapshot scheduler. Depends: `TAR-P11-002`.
- `[Todo]` `TAR-P11-012` `Analytics` `P1` Drill-down APIs with transactional permission checks. Depends: `TAR-P11-003`.
- `[Todo]` `TAR-P11-013` `Analytics` `P1` Export endpoint with audit and permission gate. Depends: `TAR-P11-002`.
- `[Todo]` `TAR-P11-014` `Analytics` `P2` Reconciliation/backfill job for missing or late events. Depends: `TAR-P11-011`.
- `[Todo]` `TAR-P11-015` `Analytics UI` `P2` Saved dashboard views and filters. Depends: `TAR-P11-007`.
- `[Todo]` `TAR-P11-016` `Executive` `P1` Executive dashboard config: widgets, default sites, date ranges. Depends: `TAR-P11-008`.
- `[Todo]` `TAR-P11-017` `Executive` `P1` Site comparison APIs and views. Depends: `TAR-P11-008`.
- `[Todo]` `TAR-P11-018` `Executive Alerts` `P1` Alert resolve/snooze/status lifecycle. Depends: `TAR-P11-009`.
- `[Todo]` `TAR-P11-019` `Executive` `P2` AI impact metrics from measured events only. Depends: `TAR-P11-005`.
- `[Todo]` `TAR-P11-020` `Privacy` `P1` Aggregate-only executive access tests and drill-down audit. Depends: `TAR-P11-008`.
- `[Todo]` `TAR-P12-008` `Privacy` `P2` De-identification policy and contract-aware cross-tenant gate. Depends: `TAR-P12-003`.
- `[Todo]` `TAR-P12-009` `Population` `P2` Cohort builder validation to prevent re-identification. Depends: `TAR-P12-002`.
- `[Todo]` `TAR-P12-010` `Population` `P2` Screening effectiveness API and view. Depends: `TAR-P12-004`.
- `[Todo]` `TAR-P12-011` `Population` `P2` Cohort data completeness and unknown-demographics buckets. Depends: `TAR-P12-004`.
- `[Todo]` `TAR-P12-012` `Population` `P2` Population export audit and patient-level export block. Depends: `TAR-P12-007`.

## Frontend Platform
- `[Todo]` `TAR-FE-002` `Frontend Platform` `P0` Role route guards and permission-aware navigation. Depends: `TAR-P1-005`.
- `[Todo]` `TAR-FE-003` `Design System` `P1` Shared component library: tables, filters, badges, timeline, source chips, confidence indicators. Depends: `TAR-P0-003`.
- `[Todo]` `TAR-FE-004` `Frontend UX` `P1` Standard loading, empty, error, offline, and permission-denied states. Depends: `TAR-FE-003`.
- `[Todo]` `TAR-FE-005` `E2E` `P1` Playwright smoke flow: login, register, upload, review. Depends: `TAR-P2-010`, `TAR-P3-009`, `TAR-P7-008`.

## Infra, Security, Compliance, MLOps
- `[Todo]` `TAR-P14-009` `Observability` `P1` Sentry/OpenTelemetry instrumentation, metrics, and alert definitions. Depends: `TAR-P0-008`.
- `[Todo]` `TAR-P14-010` `Security` `P0` Secret manager strategy and environment secret separation. Depends: `TAR-P0-004`.
- `[Todo]` `TAR-P14-011` `Security` `P0` Secure headers and CSRF policy based on token/session strategy. Depends: `TAR-P1-003`.
- `[Todo]` `TAR-P14-012` `CI/CD` `P1` Typecheck, security scan, migration dry-run, staging smoke stages. Depends: `TAR-P0-010`.
- `[Todo]` `TAR-P14-013` `DR` `P1` Backup restore drill script and evidence checklist. Depends: `TAR-P14-004`.
- `[Todo]` `TAR-P13-009` `MLOps` `P2` Evaluation dataset table/API. Depends: `TAR-P13-001`.
- `[Todo]` `TAR-P13-010` `MLOps` `P2` Evaluation harness and metrics storage. Depends: `TAR-P13-009`.
- `[Todo]` `TAR-P13-011` `Governance` `P2` Prompt approval/version diff workflow. Depends: `TAR-P13-001`.
- `[Todo]` `TAR-P13-012` `Governance` `P2` Model promotion, rollback, pause, and approval workflow. Depends: `TAR-P13-001`.
- `[Todo]` `TAR-P13-013` `MLOps` `P2` Link feedback/outcomes to exact AI output, prompt version, and clinical decision. Depends: `TAR-P13-003`.

## Deep Review Pass 2: Executive, Population, Data, Frontend, Infra, MLOps
- `[Todo]` `TAR-P11-021` `Executive Metrics` `P1` Define metric catalog with formula, source table, owner, time window, and freshness SLA. Depends: `TAR-P11-011`.
- `[Todo]` `TAR-P11-022` `Executive UX` `P1` Add widget-level freshness, completeness, and stale-data warnings. Depends: `TAR-P11-008`, `TAR-P11-021`.
- `[Todo]` `TAR-P11-023` `Executive Alerts` `P1` Add tenant/site alert threshold config with dedupe, cooldown, and hysteresis. Depends: `TAR-P11-018`.
- `[Todo]` `TAR-P11-024` `Executive Drilldown` `P1` Implement scoped drill-down handoff from executive widgets to analytics filters. Depends: `TAR-P11-012`, `TAR-P11-020`.
- `[Todo]` `TAR-P11-025` `Executive Export` `P1` Add executive export templates for CSV/PDF with aggregate suppression and audit metadata. Depends: `TAR-P11-013`, `TAR-P11-020`.
- `[Todo]` `TAR-P11-026` `Executive Revenue` `P2` Add revenue metric reconciliation rules against billing status and exclusions. Depends: `TAR-P11-006`.
- `[Todo]` `TAR-P11-027` `Executive Performance` `P2` Add cached executive overview snapshots and query budgets. Depends: `TAR-P11-011`.
- `[Todo]` `TAR-P12-013` `Cohorts` `P1` Define allowlisted cohort DSL with max dimensions, preview count, and rejected-field reasons. Depends: `TAR-P12-002`.
- `[Todo]` `TAR-P12-014` `Privacy` `P1` Add complementary suppression to prevent small cohort inference through subtraction. Depends: `TAR-P12-003`.
- `[Todo]` `TAR-P12-015` `Population Metrics` `P2` Version numerator/denominator definitions for screening and risk metrics. Depends: `TAR-P12-004`.
- `[Todo]` `TAR-P12-016` `Cohorts` `P2` Add immutable cohort snapshot versions for saved cohorts. Depends: `TAR-P12-002`.
- `[Todo]` `TAR-P12-017` `Cross-Tenant Governance` `P1` Add contract/consent registry for cross-tenant benchmarking eligibility. Depends: `TAR-P12-008`.
- `[Todo]` `TAR-P12-018` `Risk Clusters` `P2` Add cluster triage lifecycle for false positive, monitoring, escalated, resolved. Depends: `TAR-P12-005`.
- `[Todo]` `TAR-P12-019` `Population UI` `P2` Add UI states for suppressed, incomplete, stale, and unknown demographic buckets. Depends: `TAR-P12-006`, `TAR-P12-011`.
- `[Todo]` `TAR-P0-019` `Data Contracts` `P0` Add OpenAPI/Pydantic contract tests for errors, pagination, events, audit, and timestamps. Depends: `TAR-P0-015`.
- `[Todo]` `TAR-P0-020` `Database` `P0` Add migration lint/checklist gate for tenant_id, timestamps, indexes, foreign keys, and soft-delete fields. Depends: `TAR-P0-017`.
- `[Todo]` `TAR-P0-021` `Events` `P0` Add event schema versioning, compatibility rules, and replay-safe consumers. Depends: `TAR-P0-012`.
- `[Todo]` `TAR-P0-022` `API Platform` `P0` Define idempotency-key contract for unsafe POST/PATCH endpoints. Depends: `TAR-P0-011`.
- `[Todo]` `TAR-P0-023` `Data Governance` `P1` Add data classification labels for PHI, PII, operational, aggregate, and AI-derived fields. Depends: `TAR-P0-018`.
- `[Todo]` `TAR-P0-024` `Audit` `P1` Standardize sensitive read audit events, not only writes. Depends: `TAR-P1-006`.
- `[Todo]` `TAR-P0-025` `Time Contracts` `P1` Define UTC storage and tenant-local display rules for all timestamps and SLA windows. Depends: `TAR-P0-011`.
- `[Todo]` `TAR-FE-006` `Frontend Routing` `P0` Complete route skeletons for login, tenant select, patient detail, visit detail, billing, executive, population, and admin settings. Depends: `TAR-FE-002`.
- `[Todo]` `TAR-FE-007` `Tenant UX` `P0` Build tenant/site switcher with permission refresh and invalid-site fallback. Depends: `TAR-P1-004`, `TAR-FE-002`.
- `[Todo]` `TAR-FE-008` `Frontend State` `P1` Add server-state query cache conventions with cancellation, refetch, and stale-state indicators. Depends: `TAR-FE-001`.
- `[Todo]` `TAR-FE-009` `Forms` `P1` Create form validation/error mapping system for API field errors and permission failures. Depends: `TAR-FE-003`.
- `[Todo]` `TAR-FE-010` `Accessibility` `P1` Add keyboard and axe accessibility checks for core shell, tables, forms, and modals. Depends: `TAR-FE-003`.
- `[Todo]` `TAR-FE-011` `Clinical Drafts` `P1` Add draft persistence and recovery for notes, copilot artifacts, and interrupted clinical forms. Depends: `TAR-P8-006`, `TAR-FE-004`.
- `[Todo]` `TAR-FE-012` `Realtime UX` `P1` Add SSE/WebSocket client with polling fallback for queues, alerts, and notifications. Depends: `TAR-P4-006`, `TAR-FE-001`.
- `[Todo]` `TAR-FE-013` `Privacy` `P0` Add PHI-safe frontend telemetry and browser logging redaction policy. Depends: `TAR-P14-001`.
- `[Todo]` `TAR-P14-014` `Infrastructure` `P1` Add infrastructure-as-code baseline for app, database, Redis, storage, network, and environment separation. Depends: `TAR-P14-010`.
- `[Todo]` `TAR-P14-015` `Security` `P0` Define object storage bucket policy, lifecycle, encryption, private access, and signed URL controls. Depends: `TAR-P3-002`, `TAR-P14-002`.
- `[Todo]` `TAR-P14-016` `Security` `P1` Add KMS/encryption key rotation policy and evidence checklist. Depends: `TAR-P14-010`.
- `[Todo]` `TAR-P14-017` `Supply Chain` `P1` Add dependency vulnerability scanning, container scanning, license check, and SBOM generation. Depends: `TAR-P14-012`.
- `[Todo]` `TAR-P14-018` `Audit Security` `P1` Add tamper-evident audit log export or hash chain design. Depends: `TAR-P1-006`, `TAR-P14-007`.
- `[Todo]` `TAR-P14-019` `Operations Access` `P1` Add production access request workflow with MFA, time limit, approval, and reason capture. Depends: `TAR-P1-017`.
- `[Todo]` `TAR-P14-020` `Incident Response` `P1` Add PHI breach, AI unsafe output, data corruption, and outage tabletop scenarios. Depends: `TAR-P14-006`.
- `[Todo]` `TAR-P14-021` `Cost And Abuse` `P1` Add per-tenant quotas for API, upload, export, and AI usage. Depends: `TAR-P14-003`, `TAR-AI-001`.
- `[Todo]` `TAR-P13-014` `AI Ledger` `P1` Create AI output ledger linking output, sources, prompt version, model version, user, tenant, task, and downstream decision. Depends: `TAR-P13-002`, `TAR-AI-001`.
- `[Todo]` `TAR-P13-015` `Rollout Governance` `P2` Add tenant/site feature flags for model and prompt rollout stages. Depends: `TAR-P13-012`.
- `[Todo]` `TAR-P13-016` `Evaluation` `P2` Add labeling/adjudication workflow for evaluation datasets. Depends: `TAR-P13-009`.
- `[Todo]` `TAR-P13-017` `Promotion Policy` `P2` Define promotion thresholds for quality, safety, bias, and regression metrics. Depends: `TAR-P13-010`, `TAR-P13-012`.
- `[Todo]` `TAR-P13-018` `Safety Incidents` `P1` Add unsafe AI output incident workflow with triage, pause recommendation, and corrective action. Depends: `TAR-P8-015`, `TAR-P13-013`.
- `[Todo]` `TAR-P13-019` `Drift Ops` `P2` Add drift alert acknowledgement, investigation notes, and resolution states. Depends: `TAR-P13-006`.
- `[Todo]` `TAR-P13-020` `Bias Review` `P2` Add subgroup evaluation reporting where demographic data is available and permitted. Depends: `TAR-P13-010`, `TAR-P12-011`.
- `[Todo]` `TAR-P13-021` `Privacy` `P1` Add retention and redaction policy for prompt/output logs containing PHI. Depends: `TAR-P13-014`, `TAR-P0-023`.
- `[Todo]` `TAR-TRACK-006` `Tracker Quality` `P0` Add tracker lint rules for required fields. Depends: `TAR-TRACK-003`.
- `[Todo]` `TAR-TRACK-007` `Tracker Sync` `P1` Add status sync report across backlog, board, epics, and issue cards. Depends: `TAR-TRACK-006`.
- `[Todo]` `TAR-TRACK-008` `Tracker Export` `P1` Add plugin-friendly JSON export in addition to CSV. Depends: `TAR-TRACK-004`.
- `[Todo]` `TAR-TRACK-009` `Dependency Planning` `P1` Generate dependency graph and blocker report for next-ready tasks. Depends: `TAR-TRACK-003`.
- `[Todo]` `TAR-TRACK-010` `Acceptance Quality` `P1` Add definition-of-done templates by task type. Depends: `TAR-TRACK-006`.
- `[Todo]` `TAR-TRACK-011` `LLM Work Packets` `P1` Generate per-issue work packets. Depends: `TAR-TRACK-005`.
- `[Todo]` `TAR-TRACK-012` `Verification Evidence` `P1` Add verification evidence log keyed by issue ID. Depends: `TAR-TRACK-007`.

## Deep Review Pass 3: Foundation, Identity, Patient, Reports, Memory, Twin
- `[Todo]` `TAR-P0-026` `System Boundaries` `P0` Define explicit service ownership, upstream/downstream contracts, and failure behavior for every core platform service. Depends: `TAR-P0-011`.
- `[Todo]` `TAR-P0-027` `Health Contracts` `P0` Add dependency-aware health endpoints for database, Redis, storage, worker queue, and AI providers. Depends: `TAR-P0-002`.
- `[Todo]` `TAR-P0-028` `OpenAPI` `P0` Generate and publish versioned OpenAPI artifacts for frontend and external B2B consumers. Depends: `TAR-P0-019`.
- `[Todo]` `TAR-P0-029` `API Versioning` `P0` Add API version negotiation and deprecation policy for breaking healthcare workflow changes. Depends: `TAR-P0-011`.
- `[Todo]` `TAR-P0-030` `Correlation` `P0` Propagate request, correlation, tenant, user, and workflow IDs across async jobs and agent runs. Depends: `TAR-P0-008`, `TAR-P0-013`.
- `[Todo]` `TAR-P0-031` `Redis Contracts` `P1` Define cache key naming, TTL, invalidation, and tenant isolation rules for Redis. Depends: `TAR-P0-006`.
- `[Todo]` `TAR-P0-032` `Worker API` `P1` Add job submission/status API with retry count, dead-letter reason, and user-facing progress state. Depends: `TAR-P0-013`.
- `[Todo]` `TAR-P0-033` `Realtime Transport` `P1` Decide SSE versus WebSocket transport for queues, alerts, and notifications with fallback behavior. Depends: `TAR-FE-012`.
- `[Todo]` `TAR-P1-018` `Tenant Onboarding` `P0` Add tenant/site onboarding workflow with default departments, roles, and admin user bootstrap. Depends: `TAR-P1-007`.
- `[Todo]` `TAR-P1-019` `Session Security` `P0` Add access token rotation rules, refresh token device binding, and session revocation audit trail. Depends: `TAR-P1-003`.
- `[Todo]` `TAR-P1-020` `RBAC Scope` `P0` Support scoped permissions by tenant, site, department, and resource ownership. Depends: `TAR-P1-005`.
- `[Todo]` `TAR-P1-021` `Auth UX` `P1` Define login, tenant switch, expired session, locked account, and permission-denied frontend states. Depends: `TAR-P1-008`, `TAR-P1-009`.
- `[Todo]` `TAR-P1-022` `User Lifecycle` `P1` Add invite, activate, deactivate, reset password, and access review workflows. Depends: `TAR-P1-012`.
- `[Todo]` `TAR-P1-023` `Audit Coverage` `P0` Add auth, tenant selection, permission denial, sensitive read, export, and admin-change audit events. Depends: `TAR-P1-006`.
- `[Todo]` `TAR-P1-024` `Cross-Tenant Tests` `P0` Expand cross-tenant isolation tests across API, repository, worker, analytics, and frontend route guard layers. Depends: `TAR-P1-011`.
- `[Todo]` `TAR-P1-025` `B2B Access` `P1` Define B2B partner tenant access, API keys, allowed scopes, and contract-based data boundaries. Depends: `TAR-P1-020`.
- `[Todo]` `TAR-P2-017` `Patient Identity` `P0` Define MRN, external ID, phone/email, duplicate detection, and merge rules per tenant/site. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-018` `Consent` `P0` Add consent capture, revocation, and data-use policy checks for clinical, AI, analytics, and B2B workflows. Depends: `TAR-P2-001`.
- `[Todo]` `TAR-P2-019` `Patient Merge` `P1` Implement guarded patient merge/unmerge workflow with audit, conflict preview, and clinical warning banner. Depends: `TAR-P2-017`.
- `[Todo]` `TAR-P2-020` `Visit Lifecycle` `P0` Define visit state machine from registration through billing, upload, review, follow-up, and closure. Depends: `TAR-P2-002`.
- `[Todo]` `TAR-P2-021` `Clinical Flags` `P1` Add allergies, chronic conditions, pregnancy, implants, isolation, and high-risk condition flags with visibility controls. Depends: `TAR-P2-006`.
- `[Todo]` `TAR-P2-022` `Patient Search` `P1` Add safe patient search with minimum query length, tenant scoping, result masking, and sensitive read audit. Depends: `TAR-P2-005`.
- `[Todo]` `TAR-P2-023` `Patient Timeline` `P1` Add canonical timeline aggregation across visits, reports, AI outputs, tasks, follow-ups, billing, and outcomes. Depends: `TAR-P2-006`, `TAR-P5-001`.
- `[Todo]` `TAR-P2-024` `Patient Import` `P1` Add CSV/FHIR-like patient import with validation, duplicate preview, rollback, and import audit. Depends: `TAR-P2-017`.
- `[Todo]` `TAR-P2-025` `Patient Retention` `P1` Define retention, archive, legal hold, and deletion constraints for patient records. Depends: `TAR-P0-023`.
- `[Todo]` `TAR-P3-018` `Upload Security` `P0` Add malware scanning, file type verification, checksum, size limits, and quarantine workflow. Depends: `TAR-P3-002`.
- `[Todo]` `TAR-P3-019` `Report Versioning` `P0` Add report version history, addendum flow, superseded status, and clinical visibility rules. Depends: `TAR-P3-001`.
- `[Todo]` `TAR-P3-020` `DICOM` `P1` Define DICOM metadata extraction, study/series/image hierarchy, and viewer integration contract. Depends: `TAR-P3-003`.
- `[Todo]` `TAR-P3-021` `OCR Pipeline` `P1` Add OCR/extraction status, confidence, validation queue, and manual correction workflow. Depends: `TAR-P3-004`.
- `[Todo]` `TAR-P3-022` `Report Linking` `P1` Link report/image uploads to visit, ordering doctor, modality, body part, and clinical indication. Depends: `TAR-P3-001`.
- `[Todo]` `TAR-P3-023` `Source References` `P0` Store source spans/pages/images for every extracted finding and AI claim. Depends: `TAR-P3-004`, `TAR-AI-003`.
- `[Todo]` `TAR-P3-024` `Upload UX` `P1` Add resumable upload, progress, retry, duplicate detection, and staff-facing failure reasons. Depends: `TAR-P3-009`.
- `[Todo]` `TAR-P3-025` `Storage Lifecycle` `P1` Define retention, archive, deletion lock, and signed URL expiry rules for uploaded clinical files. Depends: `TAR-P14-015`.
- `[Todo]` `TAR-P3-026` `Report Access Audit` `P0` Audit report/image reads, downloads, exports, addenda, and AI extraction actions. Depends: `TAR-P1-023`.
- `[Todo]` `TAR-P5-015` `Memory Schema` `P0` Normalize memory entries by event type, source reference, confidence, actor, and clinical relevance. Depends: `TAR-P5-001`.
- `[Todo]` `TAR-P5-016` `Memory Retrieval` `P0` Implement hybrid retrieval across structured filters, vector similarity, recency, and source reliability. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-P5-017` `Memory Provenance` `P0` Require citations to report/page/finding/action for all memory-derived AI outputs. Depends: `TAR-P3-023`, `TAR-P5-015`.
- `[Todo]` `TAR-P5-018` `Memory Privacy` `P0` Enforce tenant, role, consent, and sensitive category filters at retrieval time. Depends: `TAR-P1-020`, `TAR-P2-018`.
- `[Todo]` `TAR-P5-019` `Memory Summaries` `P1` Add rolling longitudinal summaries with versioning, invalidation, and clinician correction path. Depends: `TAR-P5-003`.
- `[Todo]` `TAR-P5-020` `Vector Rebuild` `P1` Add embedding rebuild jobs with model-version tracking and stale vector detection. Depends: `TAR-P5-005`.
- `[Todo]` `TAR-P5-021` `Memory Quality` `P1` Add retrieval evaluation set with expected source references and clinically relevant recall targets. Depends: `TAR-P5-016`.
- `[Todo]` `TAR-P5-022` `Memory Write Rules` `P0` Define what can be written to memory from users, systems, AI, imports, and corrections. Depends: `TAR-P5-015`.
- `[Todo]` `TAR-P5-023` `Memory Redaction` `P1` Add redaction and legal hold behavior for memory entries and derived summaries. Depends: `TAR-P2-025`.
- `[Todo]` `TAR-P9-012` `Twin Model` `P1` Define digital twin feature schema, refresh cadence, source dependencies, and stale-state behavior. Depends: `TAR-P9-001`.
- `[Todo]` `TAR-P9-013` `Progression Score` `P1` Implement progression score calculation with explainability inputs and confidence band. Depends: `TAR-P9-002`.
- `[Todo]` `TAR-P9-014` `Behavior Score` `P2` Add adherence/no-show/follow-up behavior features with bias and fairness review. Depends: `TAR-P9-003`.
- `[Todo]` `TAR-P9-015` `Intervention History` `P1` Normalize interventions, recommendations, clinician decisions, patient actions, and outcomes. Depends: `TAR-P9-004`.
- `[Todo]` `TAR-P9-016` `Twin Snapshot` `P1` Store immutable twin snapshots for audit, comparison, and model replay. Depends: `TAR-P9-001`.
- `[Todo]` `TAR-P9-017` `Twin Explainability` `P1` Add top contributing factors, missing data warnings, and source references for twin changes. Depends: `TAR-P9-013`.
- `[Todo]` `TAR-P9-018` `Twin UI` `P2` Add patient twin panel with progression, behavior, interventions, predictions, and stale markers. Depends: `TAR-P9-006`.
- `[Todo]` `TAR-P9-019` `Twin Governance` `P1` Define clinical-use disclaimers, model version labels, and manual override/correction workflow. Depends: `TAR-P13-012`.
- `[Todo]` `TAR-P9-020` `Twin Evaluation` `P2` Add retrospective validation harness for twin features and progression labels. Depends: `TAR-P13-010`.

## Deep Review Pass 4: AI Agents, Risk, Command Center, Copilot, Workflow, Billing, Analytics
- `[Todo]` `TAR-AI-006` `Agent Registry` `P0` Add agent registry with owner, input contract, output schema, model policy, timeout, and fallback behavior. Depends: `TAR-AI-001`.
- `[Todo]` `TAR-AI-007` `Coordinator` `P0` Implement coordinator task graph with deterministic ordering, retries, compensation, and partial-result handling. Depends: `TAR-AI-001`.
- `[Todo]` `TAR-AI-008` `Agent Sandboxing` `P0` Enforce tool allowlists, PHI-safe prompts, tenant boundaries, and source-only grounding for all agents. Depends: `TAR-P1-020`, `TAR-P5-018`.
- `[Todo]` `TAR-AI-009` `Agent Observability` `P1` Add traces for prompt, model, latency, cost, tokens, output schema result, and user-visible decision impact. Depends: `TAR-P13-014`.
- `[Todo]` `TAR-AI-010` `Agent Evaluation` `P1` Add per-agent evaluation suites for risk, imaging, workflow, prediction, documentation, and follow-up outputs. Depends: `TAR-P13-010`.
- `[Todo]` `TAR-AI-011` `Agent Fallbacks` `P0` Define fallback mode when AI provider, vector DB, extraction, or memory retrieval fails. Depends: `TAR-P0-027`.
- `[Todo]` `TAR-AI-012` `Imaging Agent` `P1` Add imaging-agent contract for metadata/finding extraction, comparison, urgency cues, and source references. Depends: `TAR-P3-023`.
- `[Todo]` `TAR-AI-013` `Documentation Agent` `P1` Add documentation-agent contract for notes, summaries, and clinician-editable drafts. Depends: `TAR-P8-006`.
- `[Todo]` `TAR-AI-014` `Follow-Up Agent` `P1` Add follow-up-agent contract for due dates, missed-follow-up prediction, outreach suggestions, and escalation triggers. Depends: `TAR-P4-009`.
- `[Todo]` `TAR-AI-015` `Operations Agent` `P2` Add operations-agent contract for bottlenecks, workload forecasting, and staffing hints. Depends: `TAR-P11-004`.
- `[Todo]` `TAR-P6-014` `Risk Inputs` `P0` Define allowed risk inputs, missing-data behavior, confidence bands, and source references. Depends: `TAR-P6-001`.
- `[Todo]` `TAR-P6-015` `Risk Versioning` `P0` Version risk scoring rules/models and store score snapshots with input hashes. Depends: `TAR-P6-002`.
- `[Todo]` `TAR-P6-016` `Risk Calibration` `P1` Add calibration dashboard and threshold tuning workflow per tenant/site/modality. Depends: `TAR-P6-006`.
- `[Todo]` `TAR-P6-017` `Risk Overrides` `P0` Add clinician override, reason capture, audit, and downstream queue recalculation. Depends: `TAR-P6-008`.
- `[Todo]` `TAR-P6-018` `Risk Drift` `P2` Monitor score distribution drift, false positives, false negatives, and subgroup performance. Depends: `TAR-P13-006`.
- `[Todo]` `TAR-P6-019` `Priority Queue SLA` `P1` Define queue scoring formula combining risk, SLA, modality, role, and operational urgency. Depends: `TAR-P7-001`.
- `[Todo]` `TAR-P6-020` `Prediction Labels` `P1` Define deterioration, missed follow-up, and bottleneck outcome labels for retrospective training/evaluation. Depends: `TAR-P13-010`.
- `[Todo]` `TAR-P6-021` `Risk Explanation` `P0` Add factor-level explanations, source references, and unknown-data warnings for every risk score. Depends: `TAR-P6-014`.
- `[Todo]` `TAR-P6-022` `Risk Alerts` `P1` Add alert dedupe, cooldown, escalation, acknowledgement, and resolution states. Depends: `TAR-P4-006`.
- `[Todo]` `TAR-P6-023` `Risk Safety Tests` `P0` Add tests proving high-risk cases are not hidden by missing AI output, failed jobs, or permissions. Depends: `TAR-P6-003`.
- `[Todo]` `TAR-P7-016` `Command Queue API` `P0` Implement paginated, filterable, tenant-scoped doctor queue API with stable sort and SLA status. Depends: `TAR-P7-001`.
- `[Todo]` `TAR-P7-017` `Queue Reconciliation` `P1` Add reconciliation job for stale, duplicate, closed, or orphaned queue items. Depends: `TAR-P7-016`.
- `[Todo]` `TAR-P7-018` `Escalation UX` `P1` Add urgent escalation banner, acknowledgement, assignment, snooze, and handoff workflow. Depends: `TAR-P4-006`, `TAR-P7-005`.
- `[Todo]` `TAR-P7-019` `Similar Cases UI` `P1` Add similar-case card with source, outcome, similarity factors, and PHI-safe access controls. Depends: `TAR-P7-004`, `TAR-P5-016`.
- `[Todo]` `TAR-P7-020` `Doctor Actions` `P0` Capture doctor decision, note, follow-up order, escalation, override, and final disposition as structured events. Depends: `TAR-P7-007`.
- `[Todo]` `TAR-P7-021` `Queue Collaboration` `P1` Add assignment, comments, mentions, second-opinion request, and activity log. Depends: `TAR-P7-006`.
- `[Todo]` `TAR-P7-022` `Command Filters` `P1` Add saved filters for risk, modality, site, SLA, assigned doctor, status, and follow-up due date. Depends: `TAR-P7-008`.
- `[Todo]` `TAR-P7-023` `Command Accessibility` `P1` Add keyboard-first queue navigation, critical alert focus management, and screen-reader labels. Depends: `TAR-FE-010`.
- `[Todo]` `TAR-P7-024` `Doctor Metrics` `P2` Add doctor workload and response-time metrics with fairness guardrails and context notes. Depends: `TAR-P11-038`.
- `[Todo]` `TAR-P7-025` `Command E2E` `P1` Add E2E test covering high-risk report to queue review to doctor decision to follow-up. Depends: `TAR-FE-005`.
- `[Todo]` `TAR-P8-016` `Copilot Grounding` `P0` Require every answer to include source references or explicitly state insufficient evidence. Depends: `TAR-P5-017`.
- `[Todo]` `TAR-P8-017` `Copilot Intent Router` `P1` Route summarize, explain, retrieve, draft note, workflow question, and next-action intents to separate handlers. Depends: `TAR-P8-001`.
- `[Todo]` `TAR-P8-018` `Copilot Safety` `P0` Add refusal/escalation policy for diagnosis-only, medication, emergency, or unsupported requests. Depends: `TAR-P8-015`.
- `[Todo]` `TAR-P8-019` `Copilot Drafts` `P1` Add editable drafts, save-as-note, discard, and audit of accepted AI text. Depends: `TAR-P8-006`.
- `[Todo]` `TAR-P8-020` `Copilot Feedback` `P1` Capture helpfulness, correctness, unsafe, missing-source, and clinician correction feedback. Depends: `TAR-P8-008`.
- `[Todo]` `TAR-P8-021` `Copilot Conversation State` `P1` Store conversation context with retention limits, redaction, and visit/patient scoping. Depends: `TAR-P13-021`.
- `[Todo]` `TAR-P8-022` `Copilot Explain Risk` `P0` Explain risk and priority using only stored risk snapshot, score inputs, and cited sources. Depends: `TAR-P6-021`.
- `[Todo]` `TAR-P8-023` `Copilot Workflow Help` `P1` Answer workflow questions from product state machine and role permissions, not free-form guesses. Depends: `TAR-P4-001`, `TAR-P1-005`.
- `[Todo]` `TAR-P8-024` `Copilot Eval` `P1` Add clinical QA evaluation set for grounding, hallucination, unsafe advice, and source citation quality. Depends: `TAR-AI-010`.
- `[Todo]` `TAR-P8-025` `Copilot UI` `P1` Add copilot panel states for loading, cited response, missing evidence, permission denied, and unsafe request. Depends: `TAR-FE-004`.
- `[Todo]` `TAR-P4-015` `Workflow State Machine` `P0` Define visit/report/follow-up/task state machines with allowed transitions and audit events. Depends: `TAR-P2-020`.
- `[Todo]` `TAR-P4-016` `Task Ownership` `P1` Add assignment rules, queues, due dates, delegation, reassignment, and workload balancing. Depends: `TAR-P4-002`.
- `[Todo]` `TAR-P4-017` `Notification Preferences` `P1` Add tenant/user notification channel preferences, quiet hours, escalation policy, and delivery fallback. Depends: `TAR-P4-004`.
- `[Todo]` `TAR-P4-018` `Follow-Up Outreach` `P1` Add outreach attempts, channel, response status, failure reason, and reschedule workflow. Depends: `TAR-P4-009`.
- `[Todo]` `TAR-P4-019` `Workflow Idempotency` `P0` Add idempotency keys for task creation, notification sends, follow-up scheduling, and billing actions. Depends: `TAR-P0-022`.
- `[Todo]` `TAR-P4-020` `Escalation Policy` `P1` Add configurable escalation thresholds by risk, SLA, modality, site, and role. Depends: `TAR-P6-022`.
- `[Todo]` `TAR-P4-021` `Workflow Analytics Events` `P1` Emit standardized events for queue wait, action, assignment, notification, escalation, and closure. Depends: `TAR-P11-028`.
- `[Todo]` `TAR-P4-022` `Workflow Recovery` `P1` Add recovery jobs for stuck tasks, failed notifications, overdue follow-ups, and orphaned queue items. Depends: `TAR-P0-032`.
- `[Todo]` `TAR-P4-023` `Workflow UI` `P1` Add staff worklist, task detail, escalation detail, and follow-up schedule views. Depends: `TAR-FE-003`.
- `[Todo]` `TAR-P4-024` `Workflow Tests` `P0` Add state transition tests, permission tests, idempotency tests, and failure recovery tests. Depends: `TAR-P4-015`.
- `[Todo]` `TAR-P10-014` `Billing Domain` `P1` Define invoice, payment, discount, refund, adjustment, payer, and package data model. Depends: `TAR-P10-001`.
- `[Todo]` `TAR-P10-015` `Billing Workflow` `P1` Link billing state to visit/report workflow without blocking urgent clinical review. Depends: `TAR-P10-002`, `TAR-P4-015`.
- `[Todo]` `TAR-P10-016` `Price Lists` `P1` Add tenant/site price lists, effective dates, overrides, taxes, and audit history. Depends: `TAR-P10-003`.
- `[Todo]` `TAR-P10-017` `Billing Permissions` `P1` Add billing-specific RBAC for discounts, refunds, voids, exports, and revenue dashboards. Depends: `TAR-P1-020`.
- `[Todo]` `TAR-P10-018` `Billing Ledger` `P1` Add immutable billing ledger events with correction entries instead of destructive edits. Depends: `TAR-P10-014`.
- `[Todo]` `TAR-P10-019` `Billing Receipts` `P1` Add receipt numbering, PDF generation, print/email delivery, and audit metadata. Depends: `TAR-P10-005`.
- `[Todo]` `TAR-P10-020` `Billing Reconciliation` `P2` Add reconciliation reports for payments, pending invoices, cancelled visits, and refunds. Depends: `TAR-P10-009`.
- `[Todo]` `TAR-P10-021` `Billing Analytics Events` `P1` Emit revenue, payment, discount, refund, and cancellation events for analytics. Depends: `TAR-P11-028`.
- `[Todo]` `TAR-P10-022` `Billing UI States` `P1` Add billing screens for pending, paid, partial, refunded, void, and payment-failed states. Depends: `TAR-FE-003`.
- `[Todo]` `TAR-P10-023` `Billing Tests` `P1` Add tests for price calculation, permission gates, ledger immutability, and workflow integration. Depends: `TAR-P10-014`.
- `[Todo]` `TAR-P11-028` `Analytics Events` `P1` Define canonical event catalog, required dimensions, actor fields, tenant/site scope, and PHI classification. Depends: `TAR-P11-001`.
- `[Todo]` `TAR-P11-029` `Analytics Idempotency` `P1` Add event idempotency, replay detection, late-arriving event handling, and correction events. Depends: `TAR-P11-028`.
- `[Todo]` `TAR-P11-030` `Analytics Timezone` `P1` Add tenant-local timezone rollups with UTC storage and DST-safe reporting windows. Depends: `TAR-P0-025`.
- `[Todo]` `TAR-P11-031` `Analytics Freshness` `P1` Add freshness indicators and stale-data warnings for all analytics APIs and dashboards. Depends: `TAR-P11-011`.
- `[Todo]` `TAR-P11-032` `Metric Versioning` `P1` Version metric definitions and snapshots so historical dashboards remain explainable. Depends: `TAR-P11-021`.
- `[Todo]` `TAR-P11-033` `Dashboard APIs` `P1` Add contract-tested APIs for doctor, ops, executive, and population dashboard widgets. Depends: `TAR-P11-011`.
- `[Todo]` `TAR-P11-034` `PHI-Safe Drilldown` `P1` Add aggregate-to-record drilldown controls with permission checks, audit, and small-cell suppression. Depends: `TAR-P11-020`.
- `[Todo]` `TAR-P11-035` `Event Coverage` `P1` Add tests that each workflow transition emits expected analytics events. Depends: `TAR-P4-021`.
- `[Todo]` `TAR-P11-036` `Async Export` `P1` Add async export jobs with filters, audit metadata, expiry, and aggregate suppression. Depends: `TAR-P11-013`.
- `[Todo]` `TAR-P11-037` `Analytics UI States` `P1` Add dashboard states for loading, no data, stale, partial, suppressed, and permission denied. Depends: `TAR-FE-004`.
- `[Todo]` `TAR-P11-038` `Fair Performance Metrics` `P2` Add doctor/team performance metrics with case-mix context and anti-punitive governance. Depends: `TAR-P11-017`.
