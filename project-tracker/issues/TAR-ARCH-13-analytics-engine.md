# TAR-ARCH-13 - Analytics Engine

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-13` Analytics Engine
Priority: P2
Source: `../../docs/tarini-v6-architecture/13_ANALYTICS_ENGINE.md`

## Goal
Turn operational events into reliable metrics for workflow performance, review efficiency, AI usage, billing, risk trends, and executive dashboards.

## Functional Scope
- Analytics event and metric snapshot tables.
- Event writer service.
- Operational overview metrics.
- SLA metrics.
- AI usage metrics.
- Billing metrics.
- Analytics dashboard UI.

## Backing Tasks
- [ ] `TAR-P11-001` Create analytics events and metric snapshot tables.
- [ ] `TAR-P11-002` Implement analytics event writer.
- [ ] `TAR-P11-003` Implement operational overview metrics.
- [ ] `TAR-P11-004` Implement SLA metrics.
- [ ] `TAR-P11-005` Implement AI usage metrics.
- [ ] `TAR-P11-006` Implement billing metrics.
- [ ] `TAR-P11-007` Build analytics dashboard UI.
- [ ] `TAR-P11-010` Add analytics permission and aggregation tests.

## Implementation Notes
- Prefer append-only event capture and curated metric snapshots.
- Do not query raw PHI-heavy tables directly from dashboards.
- Aggregations must be tenant scoped and permission checked.
- Metric definitions should be stable and documented.

## Acceptance Checks
- Product modules can emit analytics events.
- Metric snapshots can be recalculated.
- Dashboard APIs return tenant-safe aggregates.
- SLA and operational metrics match source workflow data.
- Tests cover aggregation boundaries and permission behavior.

## LLM Handoff
```text
Read 13_ANALYTICS_ENGINE.md and BACKLOG.md Phase 11. Build event capture before dashboards. Keep aggregates tenant scoped and avoid exposing raw clinical rows.
```
