# TAR-ARCH-14 - Executive Dashboard

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-14` Executive Dashboard
Priority: P2
Source: `../../docs/tarini-v6-architecture/14_EXECUTIVE_DASHBOARD.md`

## Goal
Give hospital and chain leadership a concise intelligence view of workload, risk, SLA, review efficiency, bottlenecks, AI usage, billing, and alerts.

## Functional Scope
- Executive metrics API.
- Executive alert generation.
- Dashboard layout for leadership users.
- Filters for tenant, site, time window, modality, department, and risk.
- Privacy controls for aggregate-only views.

## Backing Tasks
- [ ] `TAR-P11-008` Build executive dashboard UI.
- [ ] `TAR-P11-009` Implement executive alerts.
- [ ] `TAR-ARCH-14-A` Implement executive summary API from metric snapshots.
- [ ] `TAR-ARCH-14-B` Add executive dashboard permission policy.
- [ ] `TAR-ARCH-14-C` Add privacy review for aggregate metrics.

## Implementation Notes
- Executives should see trends and exceptions, not patient-level PHI by default.
- Alerts must be explainable and link to operational evidence.
- Dashboard data should come from analytics snapshots.
- Metrics need consistent time-window semantics.

## Acceptance Checks
- Hospital Admin can view executive metrics for authorized tenant/site.
- Small or sensitive aggregates are suppressed when required.
- Alerts explain the trigger and recommended operational action.
- Dashboard does not expose patient detail unless permission explicitly allows it.

## LLM Handoff
```text
Read 14_EXECUTIVE_DASHBOARD.md. Implement only after analytics snapshots exist. Keep leadership views aggregate-first and permission-gated.
```
