# Tarini V6 Architecture Pack - Index and LLM Implementation Method

## Purpose
This folder breaks Tarini V6 into implementation-ready product architecture files. Each file is written so an engineer or LLM coding agent can understand the product intent, service boundaries, data contracts, APIs, workflows, risks, and acceptance criteria before writing code.

Use this folder as the main architecture source when scaffolding or implementing the full product.

## Product Architecture Files
- `01_SYSTEM_ARCHITECTURE.md`: End-to-end product architecture, service map, environments, deployment shape.
- `02_AUTH_RBAC_TENANCY.md`: Authentication, roles, permissions, tenant isolation, audit model.
- `03_PATIENT_VISIT_MANAGEMENT.md`: Patient registration, demographics, visits, clinical history, consent.
- `04_REPORTS_IMAGING_PIPELINE.md`: Report/image uploads, parsing, DICOM/PDF handling, storage, metadata.
- `05_CLINICAL_MEMORY_ENGINE.md`: Longitudinal memory, vector search, context assembly, source tracing.
- `06_DIGITAL_PATIENT_TWIN.md`: Patient intelligence profile, progression score, risk state, behavior score.
- `07_AI_AGENT_ORCHESTRATION.md`: Multi-agent system, coordinator, task routing, model policies.
- `08_RISK_PREDICTION_ENGINE.md`: Risk scoring, prioritization, deterioration and follow-up prediction.
- `09_DOCTOR_COMMAND_CENTER.md`: Doctor queue, urgent cases, timeline, insights, collaboration.
- `10_CLINICAL_COPILOT.md`: Copilot behavior, note drafting, explanation, clinical safety boundaries.
- `11_WORKFLOW_ESCALATION_NOTIFICATIONS.md`: Workflow state machine, escalations, alerts, reminders.
- `12_BILLING_LAYER.md`: Billing workflow, invoices, payment state, reconciliation, auditability.
- `13_ANALYTICS_ENGINE.md`: Operational dashboards, metrics, SLA, performance, model analytics.
- `14_EXECUTIVE_DASHBOARD.md`: Leadership cockpit, cross-center KPIs, strategic intelligence.
- `15_POPULATION_INTELLIGENCE.md`: Multi-center trends, cohorts, clusters, de-identification.
- `16_DATABASE_AND_DATA_CONTRACTS.md`: Schema design, data contracts, indexing, migrations.
- `17_FRONTEND_UI_ARCHITECTURE.md`: Next.js UI architecture, layouts, state, role-specific screens.
- `18_INFRA_SECURITY_COMPLIANCE.md`: Cloud, networking, security, compliance, observability, DR.
- `19_MLOPS_LEARNING_LOOP.md`: Model registry, evals, retraining, drift, shadow deployment.
- `20_IMPLEMENTATION_BACKLOG_AND_ACCEPTANCE.md`: Build order, epics, milestones, acceptance criteria.

## Global Implementation Assumptions
- Frontend: Next.js, TypeScript, App Router.
- Backend: FastAPI, Python, service-oriented architecture.
- Database: PostgreSQL for transactional data.
- Vector DB: pgvector first for MVP, external vector DB later if scale requires it.
- Cache and queues: Redis.
- Storage: S3-compatible object storage or Supabase storage.
- Observability: Sentry, OpenTelemetry, structured logs.
- Auth: JWT or session tokens with refresh flow; enterprise SSO later.
- AI: LLM + retrieval + deterministic rules + supervised ML where validated.
- Compliance posture: build as if PHI/PII is present from day one.

## LLM Handoff Method
When passing a file from this folder to an LLM implementation agent, use this prompt shape:

```text
You are implementing Tarini V6. Read the attached architecture file as the source of truth for this module.

Your task:
1. Identify the module boundaries and non-goals.
2. Create or update the required code using the existing project patterns.
3. Implement data models, APIs, services, UI, tests, and observability hooks described in the file.
4. Preserve tenant isolation, audit logging, and clinical safety requirements.
5. Return changed files, implementation notes, tests run, and any unresolved assumptions.

Do not implement autonomous clinical decision making. All clinical AI outputs must be advisory, explainable, and doctor-approved where they affect care.
```

## Standard File Method
Each product architecture file follows this structure:
- Product purpose.
- Users and roles.
- In scope.
- Out of scope.
- Core workflows.
- Data model.
- API contract.
- Events.
- Permissions.
- AI behavior where applicable.
- Failure and edge cases.
- Implementation tasks.
- Acceptance criteria.

## Non-Negotiable Product Rules
- No AI output should be presented as a guaranteed diagnosis.
- Any clinical suggestion must include uncertainty and supporting evidence.
- Every AI output must be auditable and traceable to inputs.
- Doctor action and override must be captured.
- Tenant isolation must be enforced at every query and service boundary.
- Patient identity, PHI, and uploaded clinical documents must be protected.
- Model updates must never go live automatically without validation and approval.

## Recommended Build Sequence
1. Platform foundation: tenants, users, RBAC, audit logs.
2. Patient and visit management.
3. Reports and imaging upload pipeline.
4. Workflow engine and notifications.
5. Clinical memory engine.
6. AI risk scoring MVP.
7. Doctor command center.
8. Clinical copilot.
9. Billing and analytics.
10. Executive and population intelligence.
11. Learning loop and MLOps.

## Definition of Production Ready
A module is production ready only when it has:
- Database migrations.
- API validation and error handling.
- Role and tenant access tests.
- Audit log coverage.
- Observability events.
- Rate limiting where needed.
- User-facing empty, loading, error, and success states.
- Documentation for service contracts.
- Rollback plan for risky deployments.

