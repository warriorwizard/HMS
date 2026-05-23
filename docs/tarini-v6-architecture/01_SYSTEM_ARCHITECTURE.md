# Tarini V6 System Architecture

## Product Purpose
Tarini V6 is a healthcare intelligence layer that sits above hospital, diagnostic, and lab workflows. It improves prioritization, clinical review, follow-up reliability, documentation, operational visibility, and multi-center intelligence.

The system must behave as clinical decision support, not autonomous care delivery. It gives doctors better context and better queues. Doctors remain responsible for clinical decisions.

## Core System Shape
Tarini V6 should be implemented as a modular SaaS platform with clear service boundaries. For the first production version, services can live in a monorepo and be deployed together if needed, but boundaries should be designed as if they can become independent services later.

Recommended service map:
- API Gateway / Backend entrypoint.
- Auth Service.
- Tenant and RBAC Service.
- Patient Service.
- Visit Service.
- Report and Imaging Service.
- Workflow Service.
- AI Orchestration Service.
- Clinical Memory Service.
- Risk Prediction Service.
- Copilot Service.
- Billing Service.
- Analytics Service.
- Notification Service.
- Audit Service.

## High-Level Runtime Flow
1. User authenticates and receives a tenant-scoped session.
2. Patient is registered or matched against existing records.
3. Visit is created with reason, department, priority, and billing context.
4. Report or image is uploaded and stored.
5. Metadata extraction and ingestion jobs run asynchronously.
6. Clinical memory service retrieves prior context.
7. AI coordinator routes tasks to risk, imaging, workflow, documentation, and follow-up agents.
8. Risk engine calculates priority and explanation.
9. Doctor command center updates queue in near real time.
10. Doctor reviews AI context and makes final decision.
11. Follow-up tasks and outcome tracking are created.
12. Analytics and learning loop consume events.

## Architecture Style
Use a modular service-oriented architecture:
- Synchronous APIs for user-driven operations.
- Async jobs for heavy processing.
- Event-driven updates for workflow, AI, notifications, and analytics.
- Strict data ownership by service.
- Shared libraries only for cross-cutting concerns like auth, audit, logging, and tenant context.

## Frontend Architecture
Frontend should be a role-based Next.js application.

Primary shells:
- Super Admin shell.
- Hospital Admin shell.
- Doctor shell.
- Technician shell.
- Staff shell.
- Patient shell.
- B2B Partner shell.

Core UI areas:
- Clinical workspace.
- Patient timeline.
- Doctor command center.
- AI panels.
- Workflow board.
- Upload center.
- Billing desk.
- Analytics cockpit.
- Executive dashboard.

## Backend Architecture
Use FastAPI with typed request/response models.

Backend requirements:
- Tenant context middleware.
- Auth middleware.
- Permission dependency checks.
- Request ID and correlation ID middleware.
- Audit middleware for sensitive actions.
- Structured error response format.
- OpenAPI documentation.
- Background worker interface.

Recommended backend layers:
- `api`: routers and request validation.
- `services`: business logic.
- `repositories`: database access.
- `schemas`: Pydantic DTOs.
- `models`: ORM models.
- `events`: event publish/subscribe.
- `policies`: permissions and safety checks.
- `integrations`: external systems.

## Data Architecture
Primary data systems:
- PostgreSQL: source of truth for tenants, users, patients, visits, reports, billing, workflows, audit logs.
- pgvector or vector DB: embeddings for clinical memory and similar case retrieval.
- Redis: cache, rate limiting, ephemeral job state, WebSocket fanout, queue backend where appropriate.
- Object storage: uploaded reports, images, generated exports.

Data should be designed around event history, not just current state. Clinical workflows require traceability.

## Event Architecture
Core domain events:
- `patient.created`
- `patient.updated`
- `visit.created`
- `visit.checked_in`
- `billing.invoice_created`
- `report.uploaded`
- `report.parsed`
- `ai.analysis_requested`
- `ai.analysis_completed`
- `risk.score_updated`
- `workflow.task_created`
- `workflow.task_escalated`
- `doctor.case_reviewed`
- `followup.created`
- `followup.missed`
- `outcome.recorded`
- `notification.sent`
- `audit.recorded`

Event rules:
- Events must include tenant ID.
- Events must include actor where applicable.
- Events must include correlation ID.
- Events must not leak PHI into logs or external telemetry.
- Events should be idempotent where workers may retry.

## API Principles
API endpoints should use resource-oriented paths:
- `/auth`
- `/tenants`
- `/users`
- `/patients`
- `/visits`
- `/reports`
- `/ai`
- `/copilot`
- `/workflow`
- `/billing`
- `/analytics`
- `/notifications`

Every API response should include:
- Stable IDs.
- Status.
- Timestamps.
- Tenant-scoped references.
- Clear error codes for failures.

## Security Principles
- Tenant ID must never be accepted blindly from the frontend for authorization.
- Tenant context must come from authenticated session and server-side membership.
- Every database query touching tenant-owned data must filter by tenant ID.
- Sensitive object storage files must use signed URLs with expiration.
- All clinical and billing actions must create audit logs.
- AI prompts and outputs must be stored with retention policies and access controls.

## Environments
Recommended environments:
- `local`: local developer environment with seeded data.
- `dev`: shared engineering environment.
- `staging`: production-like validation environment.
- `demo`: curated demo environment with synthetic data.
- `prod`: production environment with strict controls.

## Deployment
MVP deployment can use:
- Frontend: Vercel, Azure Static Web Apps, or containerized Next.js.
- Backend: containerized FastAPI services.
- Database: managed PostgreSQL.
- Redis: managed Redis.
- Storage: managed object storage.
- Workers: containerized background workers.

Production deployment should include:
- CI/CD gates.
- Database migration review.
- Secret management.
- Blue/green or canary deployment for AI-heavy services.
- Rollback plan.

## Observability
Required telemetry:
- Request latency.
- Error rate.
- Queue depth.
- Upload processing time.
- AI inference latency.
- AI failure rate.
- Risk score distribution.
- Alert volume.
- Doctor review time.
- Follow-up completion rate.
- Tenant-level usage.

Log fields:
- `request_id`
- `correlation_id`
- `tenant_id`
- `actor_id`
- `actor_role`
- `service`
- `event_type`
- `resource_type`
- `resource_id`
- `status`

## Key System Risks
- Tenant data leakage.
- AI overclaiming or unsafe recommendations.
- Poor data quality causing poor predictions.
- Upload pipeline failures delaying review.
- Alert fatigue.
- Hidden bias across demographics or centers.
- Integration failures with hospital systems.

## Implementation Tasks
- Create monorepo or repo structure with `frontend`, `backend`, `infra`, and `docs`.
- Implement tenant-aware backend middleware.
- Implement auth and RBAC foundation before patient data.
- Create event envelope and audit envelope.
- Build upload pipeline with async processing.
- Add clinical memory retrieval before advanced prediction.
- Build command center around workflow and risk APIs.
- Add copilot only after audit, permissions, and source tracing exist.

## Acceptance Criteria
- A user can log in and only see data for their tenant.
- A patient can be registered, assigned a visit, and linked to reports.
- Uploaded reports trigger async processing and status updates.
- AI analysis can be requested and audited.
- Doctor command center can show a prioritized queue.
- Every sensitive action produces an audit record.
- System can run locally with seeded demo data.

