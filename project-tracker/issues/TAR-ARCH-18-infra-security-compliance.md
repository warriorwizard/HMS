# TAR-ARCH-18 - Infrastructure, Security, and Compliance

Status: In Progress
Type: Architecture Module Issue
Epic: `TAR-EPIC-18` Infrastructure, Security, Compliance
Priority: P0
Source: `../../docs/tarini-v6-architecture/18_INFRA_SECURITY_COMPLIANCE.md`

## Goal
Prepare Tarini V6 for secure local development, staging, pilot, and production operation with PHI-safe logging, backups, access controls, incident response, and compliance readiness.

## Functional Scope
- Local and production infrastructure components.
- Environment strategy.
- Network and application security.
- Encryption and PHI/PII handling.
- Observability, backup, disaster recovery, CI/CD.
- Operations access controls and incident response.

## Backing Tasks
- [ ] `TAR-P0-006` Add Docker Compose for Postgres and Redis. Current status in backlog: `[Review]`.
- [x] `TAR-P0-008` Add structured logging and request ID pattern.
- [x] `TAR-P0-010` Add CI placeholder workflow.
- [ ] `TAR-P14-001` Add PHI-safe logging rules.
- [ ] `TAR-P14-002` Add signed URL expiration policy.
- [ ] `TAR-P14-003` Add rate limiting for auth and sensitive endpoints.
- [ ] `TAR-P14-004` Add backup and restore documentation.
- [ ] `TAR-P14-005` Add release readiness checklist.
- [ ] `TAR-P14-006` Add production incident response runbook.
- [ ] `TAR-P14-007` Add audit coverage review.
- [ ] `TAR-P14-008` Add clinical safety review checklist.

## Implementation Notes
- PHI-safe logging is a hard gate before pilot use.
- Backups are not complete until restore is documented and tested.
- Incident response should include clinical safety escalation, not just technical outage handling.
- Rate limits should protect auth and high-risk AI endpoints.

## Acceptance Checks
- Local infrastructure is reproducible.
- Logs include operational context but exclude PHI.
- Sensitive file URLs expire and are permission checked.
- Backup and restore process is documented.
- Release readiness and incident response checklists exist before pilot.

## LLM Handoff
```text
Read 18_INFRA_SECURITY_COMPLIANCE.md and BACKLOG.md Phase 14. Treat PHI logging, rate limits, backups, and incident response as product requirements, not optional hardening.
```
