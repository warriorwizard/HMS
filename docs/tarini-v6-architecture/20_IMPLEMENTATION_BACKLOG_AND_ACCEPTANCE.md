# Tarini V6 Implementation Backlog and Acceptance Plan

## Purpose
This file converts the architecture pack into an implementation sequence. It is meant for sprint planning, LLM agent handoffs, and engineering execution.

## Build Principle
Build the foundation before AI-heavy features. AI value depends on clean identity, tenant isolation, reports, workflow state, audit logs, and clinical memory.

## Phase 0: Repository and Engineering Foundation
Deliverables:
- Monorepo structure.
- Frontend Next.js app.
- Backend FastAPI app.
- Database migration tooling.
- Local Docker Compose.
- Shared environment config.
- CI pipeline skeleton.

Acceptance criteria:
- Developer can run frontend and backend locally.
- Health endpoint works.
- Database migrations run from empty DB.
- CI runs lint/type/test placeholders.

## Phase 1: Auth, Tenancy, RBAC, Audit
Deliverables:
- Users, tenants, memberships.
- Login and tenant selection.
- Role and permission checks.
- Tenant-scoped backend middleware.
- Audit log service.
- Role-aware frontend shell.

Acceptance criteria:
- User can log in and select tenant.
- API blocks cross-tenant access.
- Role permissions affect navigation and API.
- Sensitive actions create audit logs.

## Phase 2: Patient and Visit Management
Deliverables:
- Patient registration.
- Patient search.
- Duplicate check.
- Visit creation.
- Visit status state machine.
- Patient timeline.

Acceptance criteria:
- Staff can register patient and create visit.
- Duplicate warning appears for likely match.
- Doctor can open patient timeline.
- Visit transitions reject invalid status changes.

## Phase 3: Reports and Upload Pipeline
Deliverables:
- Secure file upload.
- Object storage integration.
- Report metadata.
- Processing job table.
- PDF text extraction baseline.
- Processing status UI.

Acceptance criteria:
- Technician can upload report to visit.
- Report processing status is visible.
- Doctor can view uploaded report.
- Failed processing does not block manual review.

## Phase 4: Workflow, Tasks, Notifications
Deliverables:
- Workflow instances.
- Tasks.
- Assignment.
- SLA timers.
- Notification center.
- Escalation rules MVP.

Acceptance criteria:
- Registration, billing, upload, review, and follow-up tasks can be tracked.
- Overdue tasks are flagged.
- Escalation creates visible task or alert.

## Phase 5: Clinical Memory Engine
Deliverables:
- Memory item model.
- Report-to-memory ingestion.
- Embeddings.
- Patient context retrieval.
- Similar case retrieval MVP.
- Retrieval audit logs.

Acceptance criteria:
- Parsed report creates memory item.
- Doctor can retrieve source-linked context.
- Similar cases are de-identified and explainable.

## Phase 6: Risk and Priority MVP
Deliverables:
- Rule-based risk scoring.
- Risk factors.
- Priority queue.
- Risk history.
- Doctor override.
- Explanation panel.

Acceptance criteria:
- Risk assessment is created after report processing.
- Queue sorts by priority and SLA.
- Risk explanation includes factors and sources.
- Doctor can override priority with reason.

## Phase 7: Doctor Command Center
Deliverables:
- Doctor queue.
- Case workspace.
- Report viewer integration.
- Timeline integration.
- Risk panel.
- Comments and escalation.
- Review completion flow.

Acceptance criteria:
- Doctor can open command center, review case, and complete decision.
- Queue updates when review status changes.
- Escalation and follow-up tasks are created.

## Phase 8: Clinical Copilot
Deliverables:
- Copilot conversation model.
- Patient-specific Q&A.
- Report summary.
- Risk explanation.
- Note drafting.
- Source citations.
- Feedback capture.

Acceptance criteria:
- Copilot answers cite sources.
- Missing context is stated.
- Draft notes require doctor approval.
- Unsafe requests are blocked or redirected.

## Phase 9: Billing
Deliverables:
- Service catalog.
- Invoice creation.
- Payment recording.
- Billing status workflow integration.
- Basic billing dashboard.

Acceptance criteria:
- Staff can create invoice and record payment.
- Payment status moves visit workflow forward.
- Discounts and voids are audited.

## Phase 10: Analytics and Executive Dashboard
Deliverables:
- Analytics events.
- Metric snapshots.
- Operational dashboard.
- AI usage dashboard.
- Executive overview.
- Alerts.

Acceptance criteria:
- Admin can see visits, TAT, SLA, queue, follow-up, and billing metrics.
- Executive dashboard shows multi-site overview.
- Exports are permission-gated and audited.

## Phase 11: Population Intelligence
Deliverables:
- Cohort definitions.
- Aggregate metric snapshots.
- Small cohort suppression.
- Risk cluster detection MVP.
- Screening effectiveness dashboard.

Acceptance criteria:
- Population views show aggregate trends.
- Small cohorts are suppressed.
- No identifiable patient data appears by default.

## Phase 12: MLOps and Learning Loop
Deliverables:
- Model registry.
- Prompt registry.
- Feedback records.
- Outcome records.
- Drift monitoring.
- Shadow-mode support.

Acceptance criteria:
- Every AI output stores model and prompt version.
- Feedback and outcomes link to AI outputs.
- Model promotion requires approval.
- Drift alerts can be generated.

## First MVP Scope Recommendation
For a credible first pilot, include:
- Auth/RBAC/tenant isolation.
- Patient and visit workflow.
- Report upload and processing.
- Workflow tasks and SLA.
- Rule-based risk priority.
- Doctor command center.
- Basic copilot summaries with citations.
- Audit logs.
- Basic analytics.

Do not include in first pilot:
- Autonomous diagnosis.
- Advanced deterioration prediction claims.
- Cross-center population intelligence using real data.
- Automatic model retraining.

## First Demo Scenario
Demo flow:
1. Staff logs in and registers patient.
2. Staff creates visit and invoice.
3. Technician uploads report.
4. System processes report and creates risk assessment.
5. Doctor command center shows urgent queue item.
6. Doctor opens case and views timeline, report, risk explanation.
7. Doctor asks copilot to summarize progression.
8. Doctor records decision and creates follow-up.
9. Admin sees SLA and workflow metrics.

## Global Acceptance Checklist
Before any production pilot:
- Tenant isolation tests pass.
- Audit logs complete for sensitive actions.
- PHI redaction in logs verified.
- File access uses signed URLs.
- AI outputs have source references.
- Clinical safety policy implemented.
- Doctor approval gates implemented.
- Backup and restore process tested.
- Demo data separated from real data.
- Release rollback plan documented.

## LLM Agent Work Packet Template
Use this when assigning work to an LLM:

```text
Task: Implement [module/feature].

Architecture files:
- [relevant file]
- 02_AUTH_RBAC_TENANCY.md
- 16_DATABASE_AND_DATA_CONTRACTS.md

Implementation requirements:
- Follow existing repo patterns.
- Add database migrations.
- Add APIs with validation.
- Add frontend states if UI is in scope.
- Add tests for tenant isolation and permissions.
- Add audit logs for sensitive actions.
- Do not implement autonomous clinical decisions.

Return:
- Files changed.
- Behavior implemented.
- Tests run.
- Risks or assumptions.
```

