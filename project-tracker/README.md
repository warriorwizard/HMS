# Tarini V6 Project Tracker

## Purpose
This folder is the working tracker for Tarini V6. It breaks the architecture into small implementation tasks and keeps visible status as work progresses.

Use this as a local Jira-style board and architecture mirror for the GitHub execution workflow.

## GitHub Execution Links
- Repository: `https://github.com/warriorwizard/HMS`
- Issues: `https://github.com/warriorwizard/HMS/issues`
- Pull Requests: `https://github.com/warriorwizard/HMS/pulls`

## How To Check Status
Open these files:

- `JIRA_BOARD.md`: Jira-style operating board with current focus, columns, and epic health.
- `EPICS.md`: product-area epics mapped to architecture files and issue cards.
- `issues/`: one issue card per architecture module.
- `STATUS_BOARD.md`: quickest view of what is in progress, next, blocked, and done.
- `JIRA_BOARD.md`: Jira-style operating board by epic/module.
- `ARCHITECTURE_GAP_QUEUE.md`: additional granular issues extracted from the architecture pack.
- `TRACEABILITY_MATRIX.md`: maps each architecture file to issue cards and gap coverage.
- `JIRA_EXPORT.csv`: CSV-style issue export that can be imported into external project tools.
- `LLM_WORK_PACKET_TEMPLATE.md`: prompt template for assigning focused implementation work.
- `BACKLOG.md`: full task breakdown grouped by product area and phase.
- `CURRENT_WORK.md`: what I am actively working on and the latest status notes.
- `DECISIONS.md`: product and engineering decisions that affect implementation.

Also check GitHub for live execution status:
- Issue state and assignment: `https://github.com/warriorwizard/HMS/issues`
- PR review and merge state: `https://github.com/warriorwizard/HMS/pulls`

## Task ID Format
Task IDs use this format:

```text
TAR-PHASE-NUMBER
```

Examples:
- `TAR-P0-001`: phase 0 task 1.
- `TAR-P1-004`: phase 1 task 4.
- `TAR-P7-009`: phase 7 task 9.

## Statuses
- `Todo`: ready but not started.
- `In Progress`: actively being worked.
- `Review`: implemented and needs verification or review.
- `Blocked`: waiting on decision, dependency, credential, data, or external system.
- `Done`: completed and verified.

## Priority
- `P0`: must exist for production foundation.
- `P1`: required for MVP.
- `P2`: important after MVP foundation.
- `P3`: future or advanced capability.

## How This Maps To Jira/Linear
Each task can become one ticket. Suggested mapping:

- Task ID -> Issue key or external ID.
- Phase -> Epic.
- Product Area -> Component.
- Status -> Workflow status.
- Priority -> Priority.
- Dependencies -> Linked issues.
- Acceptance -> Acceptance criteria.

## Working Rule
I will keep `CURRENT_WORK.md` and `STATUS_BOARD.md` updated whenever I start or finish a task.

## Board Rule
`BACKLOG.md` and `STATUS_BOARD.md` keep the original task statuses. `JIRA_BOARD.md`, `EPICS.md`, and `issues/` add planning detail and derived module status without overwriting those statuses.
