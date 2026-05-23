# Workflow, Escalation, and Notification Architecture

## Product Purpose
The Workflow Engine coordinates operational state across registration, billing, uploads, AI processing, doctor review, follow-up, escalation, and closure.

This module makes Tarini V6 behave like a dependable work system instead of a set of disconnected screens.

## Users
- Staff: manages registration, billing handoff, scheduling, and follow-up.
- Technician: handles upload and processing tasks.
- Doctor: receives review tasks, escalates, and closes clinical cases.
- Hospital Admin: monitors workflow bottlenecks and assignments.
- Patient: receives approved reminders or notifications.

## In Scope
- Workflow state machine.
- Task assignment.
- SLA timers.
- Escalation rules.
- Notifications.
- Follow-up reminders.
- Overdue detection.
- Workflow audit trail.

## Out of Scope for MVP
- Full BPMN designer.
- Complex external hospital system orchestration.
- Automated patient messaging for clinical instructions without approval.
- Advanced staff scheduling optimization.

## Workflow Domains
Primary workflow domains:
- Registration workflow.
- Billing workflow.
- Upload workflow.
- Report processing workflow.
- Doctor review workflow.
- Follow-up workflow.
- Escalation workflow.
- Patient notification workflow.

## Core Entities
`workflow_instances`:
- `id`
- `tenant_id`
- `workflow_type`
- `resource_type`
- `resource_id`
- `current_state`
- `status`
- `started_by`
- `started_at`
- `completed_at`

`workflow_tasks`:
- `id`
- `tenant_id`
- `workflow_instance_id`
- `task_type`
- `title`
- `description`
- `assigned_to_user_id`
- `assigned_to_role`
- `status`
- `priority`
- `due_at`
- `completed_by`
- `completed_at`
- `created_at`

`workflow_transitions`:
- `id`
- `tenant_id`
- `workflow_instance_id`
- `from_state`
- `to_state`
- `trigger`
- `actor_id`
- `metadata`
- `created_at`

`notifications`:
- `id`
- `tenant_id`
- `recipient_user_id`
- `recipient_patient_id`
- `channel`
- `notification_type`
- `title`
- `body`
- `status`
- `scheduled_at`
- `sent_at`
- `created_at`

`escalation_rules`:
- `id`
- `tenant_id`
- `rule_name`
- `resource_type`
- `condition`
- `action`
- `enabled`
- `created_at`

## Task Statuses
- `open`
- `assigned`
- `in_progress`
- `blocked`
- `completed`
- `cancelled`
- `overdue`
- `escalated`

## Workflow State Machine
Recommended patient visit workflow:
- `registered`
- `billing_pending`
- `upload_pending`
- `processing_pending`
- `ai_review_pending`
- `doctor_review_pending`
- `doctor_review_in_progress`
- `followup_pending`
- `closed`

Workflow transitions should be explicit and logged.

## SLA Rules
SLA timers should support:
- Time from registration to upload.
- Time from upload to processing complete.
- Time from ready for review to doctor review start.
- Time from doctor review start to completion.
- Time from follow-up created to follow-up completed.

SLA status:
- `on_track`
- `at_risk`
- `breached`
- `paused`

## Escalation Rules
Examples:
- If critical risk case is not opened within 15 minutes, escalate to doctor lead.
- If report processing fails twice, assign technician task.
- If follow-up not completed within due date, notify staff.
- If patient cannot be contacted after three attempts, escalate to care coordinator.

Escalation actions:
- Create task.
- Reassign task.
- Increase priority.
- Send notification.
- Add command center alert.
- Notify admin dashboard.

## Notification Channels
MVP:
- In-app notification.
- Email for operational users.

Future:
- SMS.
- WhatsApp.
- Voice call integration.
- Push notification.

Patient notifications require consent and template controls.

## API Endpoints
- `GET /workflow/tasks`
- `POST /workflow/tasks`
- `PATCH /workflow/tasks/{task_id}`
- `POST /workflow/tasks/{task_id}/complete`
- `POST /workflow/tasks/{task_id}/assign`
- `GET /workflow/instances/{instance_id}`
- `POST /workflow/instances/{instance_id}/transition`
- `GET /notifications`
- `POST /notifications`
- `PATCH /notifications/{notification_id}/read`
- `GET /escalation-rules`
- `POST /escalation-rules`
- `PATCH /escalation-rules/{rule_id}`

## Events
- `workflow.instance_started`
- `workflow.state_changed`
- `workflow.task_created`
- `workflow.task_assigned`
- `workflow.task_completed`
- `workflow.task_overdue`
- `workflow.task_escalated`
- `notification.created`
- `notification.sent`
- `notification.failed`

## Permissions
- `workflow.read`: Staff, Technician, Doctor, Hospital Admin.
- `workflow.assign`: Hospital Admin, department lead.
- `workflow.complete_task`: assigned user or authorized role.
- `workflow.configure`: Hospital Admin.
- `notification.read`: recipient.
- `notification.send_patient`: Staff with consent policy or Doctor approval.

## UI Requirements
Screens:
- Worklist.
- Task detail.
- Workflow timeline.
- Escalation center.
- Notification center.
- Follow-up board.

UX priorities:
- Clear ownership.
- Clear next action.
- Visible due time.
- Minimal clicks to complete common tasks.
- Role-specific queues.

## Failure and Edge Cases
- Assigned user inactive: reassign to role queue.
- Notification fails: retry and expose failed status.
- Workflow stuck: admin can manually transition with reason.
- Duplicate events: transitions must be idempotent.
- Patient notification consent missing: block patient channel.

## Implementation Tasks
- Create workflow tables.
- Implement state machine helper.
- Implement task assignment service.
- Implement SLA evaluator worker.
- Implement escalation rule evaluator.
- Implement notification service abstraction.
- Add UI worklist and notification bell.
- Add tests for valid/invalid transitions.

## Acceptance Criteria
- Visit workflow advances as reports, AI, and doctor reviews happen.
- Tasks are assigned to users or roles.
- Overdue tasks are detected and escalated.
- Notifications are sent and tracked.
- Manual overrides require reason and audit trail.

## LLM Implementation Notes
Tell implementation agents to keep workflow logic explicit and testable. A simple state machine with events is better than scattered status updates across services.

