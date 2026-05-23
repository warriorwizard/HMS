# HMS

Tarini V6 is an AI-powered Healthcare Intelligence Layer for clinical workflow, report intelligence, doctor prioritization, follow-up tracking, operational analytics, and future population intelligence.

This repository is being built from the architecture pack in `docs/tarini-v6-architecture`.

## Workspace Structure
- `frontend`: Next.js and TypeScript application.
- `backend`: FastAPI backend services.
- `infra`: local and production infrastructure definitions.
- `packages`: shared contracts and utilities.
- `scripts`: development and maintenance scripts.
- `docs`: product blueprint, architecture, and implementation guides.
- `project-tracker`: local Jira-style tracker and current work board.

## Status Tracking
Check current implementation status in:

- `project-tracker/STATUS_BOARD.md`
- `project-tracker/CURRENT_WORK.md`
- `project-tracker/BACKLOG.md`

## Local Development
Use the local development guide:

- `docs/LOCAL_DEVELOPMENT.md`

Current local URLs:

- Frontend: `http://127.0.0.1:3000`
- Backend health: `http://127.0.0.1:8000/api/v1/health`

## Architecture Source Of Truth
Start with:

- `docs/tarini-v6-architecture/00_INDEX_AND_LLM_METHOD.md`
- `docs/tarini-v6-architecture/01_SYSTEM_ARCHITECTURE.md`
- `docs/tarini-v6-architecture/20_IMPLEMENTATION_BACKLOG_AND_ACCEPTANCE.md`

## Build Order
The product will be implemented in this order:

1. Engineering foundation.
2. Auth, tenancy, RBAC, and audit.
3. Patient and visit management.
4. Reports and imaging pipeline.
5. Workflow and notifications.
6. Clinical memory.
7. Risk and priority.
8. Doctor command center.
9. Clinical copilot.
10. Billing, analytics, population intelligence, and MLOps.
