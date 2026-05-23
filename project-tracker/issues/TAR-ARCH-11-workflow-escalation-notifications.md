# TAR-ARCH-11 - Workflow, Escalation, and Notifications

Status: Ready
Type: Architecture Module Issue
Epic: `TAR-EPIC-11` Workflow, Escalation, Notifications
Priority: P1
Source: `../../docs/tarini-v6-architecture/11_WORKFLOW_ESCALATION_NOTIFICATIONS.md`

## Goal
Create the workflow engine that turns visits, reports, billing, review, escalation, and follow-up into visible, assignable, auditable work.

## Functional Scope
- Workflow, task, transition, escalation, and notification tables.
- Workflow state machine service.
- Task creation and assignment APIs.
- SLA evaluator and escalation worker.
- In-app notification service.
- Worklist and notification center UI.

## Backing Tasks
- [ ] `TAR-P4-001` Create workflow, task, transition, notification tables.
- [ ] `TAR-P4-002` Implement workflow state machine service.
- [ ] `TAR-P4-003` Implement task creation and assignment APIs.
- [ ] `TAR-P4-004` Implement SLA evaluator worker.
- [ ] `TAR-P4-005` Implement escalation rule evaluator.
- [ ] `TAR-P4-006` Implement in-app notification service.
- [ ] `TAR-P4-007` Build worklist UI.
- [ ] `TAR-P4-008` Build notification center UI.
- [ ] `TAR-P4-009` Add workflow transition tests.

## Implementation Notes
- State transitions should be explicit and validated.
- SLA rules should be configurable per tenant or site eventually.
- Notifications should be idempotent to avoid duplicate alerts.
- Escalations should create audit and timeline events.

## Acceptance Checks
- Tasks can be created, assigned, transitioned, and completed.
- Invalid transitions fail cleanly.
- SLA breaches generate escalation records.
- Notifications are visible to the correct users.
- Workflow state updates integrate with patient timeline and command center.

## LLM Handoff
```text
Read 11_WORKFLOW_ESCALATION_NOTIFICATIONS.md and BACKLOG.md Phase 4. Build the state machine before UI. Keep transitions auditable and idempotent.
```
