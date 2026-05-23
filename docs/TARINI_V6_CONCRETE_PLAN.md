# TARINI V6 — Concrete Product Execution Plan

## Goal
Build Tarini V6 as a production-grade healthcare intelligence platform with safe clinical decision support, strong tenant isolation, measurable outcomes, and deployment readiness for multi-center healthcare organizations.

## Delivery Principles
- AI assists clinicians; AI does not make final clinical decisions.
- Every prediction must have confidence, rationale, and auditability.
- PHI/PII security, consent, and compliance are non-negotiable.
- Deliver value in staged releases with measurable metrics.
- Avoid overclaiming capabilities before clinical validation.

## Feasibility Snapshot: What Is Possible vs Not Yet

### Possible in V1-V2 (High Confidence)
- Multi-tenant SaaS with strict RBAC and audit logs.
- Patient/visit/report workflow with image and document uploads.
- Rule + ML hybrid risk scoring for triage prioritization.
- Doctor command center with queueing, risk timeline, and alerts.
- Copilot for summarization, note drafting, and workflow Q&A.
- Similar-case retrieval using vector search over historical records.
- Operational analytics (turnaround time, backlog, SLA adherence).

### Possible with Strong Preconditions (Medium Confidence)
- Deterioration prediction with clinically meaningful calibration.
- Missed follow-up prediction and intervention recommendations.
- Population-level trend and cluster intelligence across centers.
- Learning loop that retrains models from outcomes safely.

Preconditions:
- Large, clean, labeled longitudinal datasets.
- Clinical governance board and validation protocol.
- Bias/fairness monitoring and drift management.
- MLOps + model registry + evaluation pipeline.

### Not Safe to Promise Early (Low Confidence / Should Be Deferred)
- Fully autonomous clinical decision making.
- Guaranteed diagnosis correctness.
- "Self-learning" model updates directly in production without review.
- Broad cross-hospital model generalization without local re-validation.
- Regulatory-grade clinical claims without formal trials/approvals.

## Reference Architecture (Production)

### Frontend
- Next.js (App Router) + TypeScript.
- Role-driven UI shells: Admin, Doctor, Technician, Patient.
- Real-time queue updates via WebSocket/SSE.

### Backend
- FastAPI microservices with API gateway.
- Services: auth, patient, report, AI, workflow, billing, analytics, notification.
- Event bus for async workloads (upload processing, AI inference, alerts).

### Data Layer
- PostgreSQL for transactional data.
- Vector DB for clinical memory and similar-case retrieval.
- Redis for caching, queues, rate limits, session acceleration.
- Object storage (S3/Supabase) for reports/images.

### AI Layer
- Model orchestration + prompt/agent policies.
- Agent coordinator with task routing to specialist agents.
- Inference logging with explanations and confidence trails.

### Security & Compliance
- Tenant isolation at row and service boundaries.
- End-to-end encryption, KMS-managed keys, secret rotation.
- Immutable audit logs for all user and AI actions.
- Consent and data-retention policy engine.

### Observability
- Sentry + OpenTelemetry + centralized logs.
- Model metrics: latency, drift, calibration, false alerts.
- Clinical ops metrics: TAT, escalation time, review throughput.

## Execution Plan (12-Month Program)

## Phase 0 (Weeks 1-3): Product & Compliance Foundation
Deliverables:
- PRD + system architecture + risk register.
- Clinical governance charter and model safety policy.
- Data model v1, API contracts v1, security baseline.
Success Metrics:
- Signed architecture decision records.
- Defined KPI baseline and acceptance criteria.

## Phase 1 (Weeks 4-8): Core Platform Foundation
Deliverables:
- Auth, RBAC, tenants, audit logs.
- Core UI shell and dashboard framework.
- CI/CD, IaC baseline, environment strategy.
Success Metrics:
- Multi-tenant isolation tests passing.
- Deployment pipeline stable across dev/stage.

## Phase 2 (Weeks 9-14): Patient + Report Workflow
Deliverables:
- Patient lifecycle: registration, visit, follow-up scaffolding.
- Upload pipeline for reports/images with metadata extraction.
- Workflow state machine and SLA timers.
Success Metrics:
- End-to-end workflow under target latency.
- >95% workflow event tracking completeness.

## Phase 3 (Weeks 15-20): Intelligence MVP
Deliverables:
- Clinical memory retrieval and similar-case search.
- Rule+ML risk prioritization engine.
- Explainability panel (factors, confidence, references).
Success Metrics:
- Top-k retrieval quality benchmark target met.
- Risk ranking usefulness accepted by pilot clinicians.

## Phase 4 (Weeks 21-26): Doctor Command Center
Deliverables:
- AI priority queue, risk evolution timeline, escalation workflows.
- Collaboration tools and urgent case alerting.
- Smart filtering and workload balancing.
Success Metrics:
- Median review time reduction in pilot.
- High-severity case visibility SLA met.

## Phase 5 (Weeks 27-32): Clinical Copilot
Deliverables:
- Copilot for summaries, note drafts, and guided next-action support.
- Doctor-in-the-loop approval and edit controls.
- Copilot safety policies (blocked intents, uncertainty responses).
Success Metrics:
- Documentation time reduction.
- High clinician acceptance and low unsafe suggestion rate.

## Phase 6 (Weeks 33-38): Billing + Ops Analytics
Deliverables:
- Billing workflows, coding helpers, revenue cycle events.
- Operational analytics dashboards and executive KPIs.
Success Metrics:
- Reduced billing leakage indicators.
- Improved TAT and bottleneck detection reliability.

## Phase 7 (Weeks 39-46): Learning Loop + Population Intelligence
Deliverables:
- Outcome capture and feedback-driven model evaluation.
- Drift monitoring, retrain workflow, controlled rollout.
- Cross-center analytics with de-identification controls.
Success Metrics:
- Drift detection to retrain cycle within agreed SLO.
- Population dashboards validated by ops leadership.

## Phase 8 (Weeks 47-52): Hardening, Deployment, Demo
Deliverables:
- Security testing, performance testing, disaster recovery drills.
- Production runbooks, on-call setup, support playbooks.
- Demo environment and enterprise onboarding package.
Success Metrics:
- Go-live readiness checklist complete.
- Successful pilot-to-production transition.

## Non-Negotiable Backlog Items
- Human-in-the-loop gating for clinical recommendations.
- Explainability, confidence, and source traceability in UI.
- Full auditability of AI outputs and user overrides.
- Data quality scoring and missing-data handling.
- Bias/fairness checks across cohorts and sites.

## Key Risks and Mitigations
- Data sparsity/quality risk: implement data contracts, validation, and curation pipeline.
- Clinical trust risk: co-design with doctors, transparent explanations, easy override.
- Alert fatigue risk: threshold tuning, role-aware alerts, feedback loop.
- Model drift risk: scheduled monitoring and shadow deployments.
- Integration risk with hospital systems: standards adapters and phased connectors.

## Minimum Team for Full Product Build
- Product Manager (1)
- Engineering Manager / Architect (1)
- Frontend Engineers (2-3)
- Backend Engineers (3-4)
- ML Engineers (2-3)
- QA + Automation (2)
- DevOps/SRE (1-2)
- Clinical Informatics Lead (1)
- Security/Compliance Lead (shared or 1)

## What We Should Decide Immediately
- Primary market and compliance scope for first launch geography.
- Pilot partner profile (single hospital vs diagnostic chain).
- First 3 measurable outcomes:
  - Reduction in critical-case review delays.
  - Improvement in follow-up adherence.
  - Reduction in report turnaround time.

## Suggested Next 30 Days
- Finalize PRD and clinical safety policy.
- Build clickable UX prototype for Doctor Command Center.
- Set up platform skeleton (auth, tenant, audit, CI/CD, infra).
- Start data readiness audit with pilot institution.
- Lock MVP scope for first pilot release.
