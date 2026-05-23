# Doctor Command Center Architecture

## Product Purpose
The Doctor Command Center is the primary clinical operations screen for doctors. It turns patient visits, reports, AI analysis, risk, and workflow tasks into a prioritized review experience.

This is one of the central product surfaces. It must be fast, dense, trustworthy, and designed for repeated clinical use.

## Users
- Doctor: reviews prioritized cases and takes action.
- Radiologist: reviews imaging-heavy cases.
- Hospital Admin: monitors queue load and assignment.
- Staff: may track case status without clinical decision controls.

## In Scope
- AI priority queue.
- Urgent case alerts.
- Risk evolution timeline.
- Similar case retrieval.
- Clinical insights feed.
- Follow-up intelligence.
- Escalation system.
- Collaboration comments.
- Smart filters.
- Doctor decision capture.

## Out of Scope for MVP
- Full PACS viewer replacement.
- Full EMR charting.
- Autonomous order entry.
- Patient chat from doctor command center unless explicitly enabled.

## Core Entities
`doctor_queue_items`:
- `id`
- `tenant_id`
- `visit_id`
- `patient_id`
- `assigned_doctor_id`
- `queue_status`
- `priority_band`
- `priority_score`
- `risk_assessment_id`
- `sla_due_at`
- `last_activity_at`
- `created_at`

`case_reviews`:
- `id`
- `tenant_id`
- `visit_id`
- `patient_id`
- `doctor_id`
- `status`
- `decision_summary`
- `doctor_notes`
- `ai_used`
- `started_at`
- `completed_at`

`case_comments`:
- `id`
- `tenant_id`
- `visit_id`
- `author_id`
- `body`
- `visibility`
- `created_at`

`case_escalations`:
- `id`
- `tenant_id`
- `visit_id`
- `escalated_by`
- `assigned_to`
- `reason`
- `status`
- `created_at`
- `resolved_at`

## Queue Statuses
- `new`
- `ready_for_review`
- `in_review`
- `waiting_for_information`
- `escalated`
- `followup_required`
- `completed`
- `dismissed`

## Primary Screen Layout
Recommended layout:
- Left: queue list with filters and sort.
- Center: selected case workspace.
- Right: AI panel, risk explanation, similar cases, follow-up suggestions.
- Top: urgent alerts and workload indicators.

Queue item should show:
- Patient name or masked display based on role.
- Age/sex where allowed.
- Visit reason.
- Report type/modality.
- Risk band.
- SLA time remaining.
- Status.
- Assigned doctor.
- AI confidence and warnings.

## Workflow
1. Doctor opens command center.
2. Queue loads cases assigned to doctor or department.
3. Doctor filters by risk, report type, SLA, status, site.
4. Doctor selects case.
5. System marks item `in_review`.
6. Doctor reviews reports, timeline, risk explanation, memory, and copilot.
7. Doctor records decision.
8. Doctor creates follow-up, escalation, or closes case.
9. Outcome and review metrics are stored.

## Doctor Decision Types
- `review_completed_no_action`
- `followup_required`
- `urgent_escalation`
- `additional_information_needed`
- `refer_to_specialist`
- `report_correction_needed`
- `patient_contact_required`

## API Endpoints
- `GET /doctor/command-center/queue`
- `GET /doctor/command-center/queue/{item_id}`
- `POST /doctor/command-center/queue/{item_id}/claim`
- `POST /doctor/command-center/queue/{item_id}/start-review`
- `POST /doctor/command-center/queue/{item_id}/complete-review`
- `POST /doctor/command-center/queue/{item_id}/escalate`
- `GET /visits/{visit_id}/case-workspace`
- `POST /visits/{visit_id}/comments`
- `GET /visits/{visit_id}/insights`

## Events
- `doctor.queue_loaded`
- `doctor.case_opened`
- `doctor.review_started`
- `doctor.review_completed`
- `doctor.priority_overridden`
- `doctor.case_escalated`
- `doctor.followup_requested`
- `doctor.comment_added`

## Filters
Must support:
- Risk band.
- SLA status.
- Report type.
- Site.
- Department.
- Assigned doctor.
- Queue status.
- Follow-up required.
- AI warning present.
- Date range.

## Collaboration
Collaboration features:
- Case comments.
- Assignment transfer.
- Escalation to specialist.
- Internal note visibility.
- Mention notification later.

Comments must be auditable. If comments can include clinical content, they are PHI and must follow retention rules.

## AI Panel Requirements
AI panel should show:
- Risk summary.
- Evidence references.
- Missing data.
- Similar cases.
- Suggested next actions.
- Copilot question entry.
- Confidence and safety flags.

AI panel must not:
- Hide uncertainty.
- Present AI as final clinical authority.
- Auto-commit actions without doctor approval.

## Performance Requirements
- Queue initial load target: under 2 seconds for typical doctor queue.
- Case workspace target: under 3 seconds for common case.
- Async load heavy AI/history panels.
- Real-time updates through SSE/WebSocket or polling fallback.

## Failure and Edge Cases
- AI unavailable: command center still works with manual review.
- Risk unknown: queue uses SLA/date ordering and marks unknown.
- Two doctors open same case: show active reviewer and locking/claim rules.
- Missing report file: show processing state and route to technician.
- Escalated case unresolved: keep prominent until resolved.

## Implementation Tasks
- Build queue item model and API.
- Implement queue sorting and filters.
- Build case workspace endpoint.
- Implement review lifecycle.
- Implement comments and escalations.
- Build frontend command center shell.
- Add real-time queue refresh.
- Add tests for permissions and state transitions.

## Acceptance Criteria
- Doctor can see prioritized queue.
- Doctor can open a case and review all relevant context.
- Doctor can complete review with decision.
- Escalations and follow-ups update workflow.
- AI output is visible with evidence, confidence, and warnings.
- Queue remains useful when AI is unavailable.

## LLM Implementation Notes
Tell implementation agents to build the command center as the operational heart of the product. Prioritize queue correctness, state transitions, and fast scanning before visual polish.

