# TAR-ARCH-15 - Population Intelligence

Status: Later
Type: Architecture Module Issue
Epic: `TAR-EPIC-15` Population Intelligence
Priority: P3
Source: `../../docs/tarini-v6-architecture/15_POPULATION_INTELLIGENCE.md`

## Goal
Provide privacy-preserving intelligence across centers, regions, demographics, risk clusters, and screening effectiveness.

## Functional Scope
- Cohort and population metric tables.
- Cohort definition schema.
- Small cohort suppression.
- Population overview metrics.
- Risk cluster detection MVP.
- Population intelligence UI.

## Backing Tasks
- [ ] `TAR-P12-001` Create cohort and population metric tables.
- [ ] `TAR-P12-002` Implement cohort definition schema.
- [ ] `TAR-P12-003` Implement small cohort suppression.
- [ ] `TAR-P12-004` Implement population overview metrics.
- [ ] `TAR-P12-005` Implement risk cluster detection MVP.
- [ ] `TAR-P12-006` Build population intelligence UI.
- [ ] `TAR-P12-007` Add de-identification and suppression tests.

## Implementation Notes
- This epic requires mature analytics and privacy governance.
- Small groups must be suppressed to reduce re-identification risk.
- Regional insights should be aggregate and de-identified.
- Screening effectiveness needs consistent denominator definitions.

## Acceptance Checks
- Cohorts can be defined without exposing raw patient rows.
- Small cohorts are suppressed.
- Population metrics are tenant and permission scoped.
- Risk cluster output includes uncertainty and limitations.
- Tests cover de-identification and suppression behavior.

## LLM Handoff
```text
Read 15_POPULATION_INTELLIGENCE.md and BACKLOG.md Phase 12. Do not start until analytics foundations exist. Prioritize privacy controls over visual polish.
```
