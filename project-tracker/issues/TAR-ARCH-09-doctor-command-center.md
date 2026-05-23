# TAR-ARCH-09 - Doctor Command Center

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-09` Doctor Command Center
Priority: P1
Source: `../../docs/tarini-v6-architecture/09_DOCTOR_COMMAND_CENTER.md`

## Goal
Give doctors a high-signal command center for priority queues, risk evolution, similar cases, review actions, escalations, collaboration, and follow-up intelligence.

## Functional Scope
- Doctor queue, review, comment, and escalation tables.
- Queue API with filters and risk ordering.
- Case workspace API.
- Claim/start review and complete review flows.
- Collaboration comments and escalation actions.
- Command center queue UI and case workspace UI.

## Backing Tasks
- [ ] `TAR-P7-001` Create doctor queue, review, comment, escalation tables.
- [ ] `TAR-P7-002` Implement command center queue API.
- [ ] `TAR-P7-003` Implement case workspace API.
- [ ] `TAR-P7-004` Implement start review and claim flow.
- [ ] `TAR-P7-005` Implement complete review flow.
- [ ] `TAR-P7-006` Implement case comments.
- [ ] `TAR-P7-007` Implement case escalation.
- [ ] `TAR-P7-008` Build command center queue UI.
- [ ] `TAR-P7-009` Build case workspace UI.
- [ ] `TAR-P7-010` Add queue sorting and permission tests.

## Implementation Notes
- Queue ordering must be explainable, not opaque.
- The workspace should bring together patient timeline, reports, risk, memory, and copilot context.
- Claiming a case should prevent duplicate review conflicts.
- Doctor decisions are human actions and must be audit logged.

## Acceptance Checks
- Doctor sees only permitted tenant/site cases.
- Queue sorts by risk, urgency, SLA, and assignment rules.
- A doctor can claim, review, comment, escalate, and complete a case.
- Every action updates timeline and audit logs.
- UI remains usable for repeated daily work, not just demo flow.

## LLM Handoff
```text
Read 09_DOCTOR_COMMAND_CENTER.md and BACKLOG.md Phase 7. Implement queue contracts after risk priority data exists. Keep doctor actions auditable and reversible where possible.
```
