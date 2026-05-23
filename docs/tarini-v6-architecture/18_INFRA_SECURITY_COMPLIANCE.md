# Infrastructure, Security, and Compliance Architecture

## Product Purpose
This architecture defines how Tarini V6 should be deployed, secured, monitored, and operated for healthcare-grade workloads.

The system should assume protected health information is present from day one.

## Infrastructure Components
Frontend:
- Next.js hosting.

Backend:
- FastAPI services.
- Background workers.
- API gateway or ingress.

Data:
- Managed PostgreSQL.
- Redis.
- Object storage.
- Vector index through pgvector or external vector DB.

Observability:
- Sentry.
- OpenTelemetry.
- Centralized logs.
- Metrics and alerts.

Security:
- Secret manager.
- KMS-managed encryption keys.
- WAF where available.
- Network segmentation.

## Environment Strategy
Environments:
- `local`: developer machine.
- `dev`: shared engineering.
- `staging`: production-like.
- `demo`: synthetic customer demos.
- `prod`: live customers.

Rules:
- Production data never copied to local.
- Demo uses synthetic or de-identified data.
- Staging may use de-identified data only.
- Environment secrets separated.

## Network Security
Recommended:
- HTTPS everywhere.
- Private database networking.
- Backend only can access database.
- Storage buckets not public.
- Signed URLs for file access.
- IP allowlists for admin tools where feasible.
- WAF for public endpoints.

## Application Security
Required:
- Auth middleware.
- Tenant context middleware.
- Permission checks.
- Input validation.
- Rate limiting.
- Secure headers.
- CSRF protection where session cookies are used.
- File upload scanning.
- Audit logs.
- API error sanitization.

## Encryption
At rest:
- Database encryption.
- Object storage encryption.
- Backup encryption.

In transit:
- TLS.
- Service-to-service TLS where feasible.

Secrets:
- Use secret manager.
- No secrets in repository.
- Rotate secrets.
- Separate secrets per environment.

## PHI/PII Handling
Rules:
- Do not log raw PHI.
- Hash or redact identifiers in logs.
- Limit prompt content to necessary context.
- Store AI prompts/outputs under PHI controls.
- Use retention policies.
- Audit exports and downloads.

## Compliance Readiness
The product should be built to support:
- HIPAA-style safeguards if deployed for US customers.
- Local healthcare privacy laws based on launch geography.
- Data processing agreements.
- Business associate agreements where applicable.
- Access logs and audit controls.
- Incident response procedures.

This file does not certify compliance. It defines implementation controls that support compliance work.

## Observability
Metrics:
- API latency.
- API errors.
- Worker failures.
- Queue depth.
- Database connections.
- Upload failures.
- AI latency.
- AI safety flags.
- Notification failures.
- SLA breach events.

Alerts:
- API error spike.
- Database unavailable.
- Queue backlog high.
- File processing failure spike.
- Critical case SLA breach.
- AI safety flag spike.
- Unauthorized access spike.

## Backup and Disaster Recovery
Requirements:
- Automated database backups.
- Point-in-time recovery.
- Object storage lifecycle and backup policy.
- Restore drill schedule.
- Recovery time objective.
- Recovery point objective.

MVP targets:
- RPO: 24 hours or better.
- RTO: 8 hours or better.

Production target should be stricter based on customer contracts.

## CI/CD
Pipeline stages:
- Install dependencies.
- Lint.
- Type check.
- Unit tests.
- Integration tests.
- Build containers.
- Security scan.
- Migration dry-run.
- Deploy to staging.
- Smoke test.
- Promote to production.

## Access Control for Operations
Production access:
- Least privilege.
- MFA.
- Break-glass process.
- Time-limited elevated access.
- Audit every production data access.

## Incident Response
Incident classes:
- Security incident.
- PHI exposure.
- Service outage.
- AI unsafe output.
- Data corruption.
- Integration failure.

Incident record should capture:
- Time detected.
- Impacted tenants.
- Systems affected.
- Containment steps.
- Customer communication.
- Root cause.
- Corrective actions.

## Implementation Tasks
- Add environment config strategy.
- Add secret manager integration.
- Add structured logging.
- Add Sentry and OpenTelemetry.
- Add rate limiting.
- Add upload scanning hook.
- Add backup plan.
- Add deployment pipeline.
- Add security checklist to release process.

## Acceptance Criteria
- No secrets committed.
- All APIs require auth unless explicitly public.
- Tenant isolation tests run in CI.
- Logs redact PHI.
- Backups are configured.
- Production deployment has rollback plan.
- Sensitive exports are audited.

## LLM Implementation Notes
Tell implementation agents to treat security and audit as architecture, not polish. Every feature touching PHI must include access control and logging.

