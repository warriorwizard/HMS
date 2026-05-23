# Tarini V6 Decisions Log

## DEC-001: Use Local Markdown Tracker First
Date: 2026-05-22

Decision:
Use a local markdown-based tracker in `project-tracker` before integrating an external project management system.

Reason:
There is no active Jira-style plugin available in this workspace. A local tracker is immediate, transparent, versionable, and can be imported into Jira, Linear, GitHub Projects, or Notion later.

Impact:
All work will use stable task IDs such as `TAR-P0-001`. Status is visible in `STATUS_BOARD.md` and `CURRENT_WORK.md`.

## DEC-002: Build Foundation Before AI Features
Date: 2026-05-22

Decision:
Start implementation with repository structure, backend/frontend skeletons, auth, tenant isolation, and audit foundations before building AI-heavy modules.

Reason:
Clinical AI features require secure data boundaries, audit logs, patient workflow state, and source traceability.

Impact:
Initial tasks prioritize engineering and safety infrastructure.

