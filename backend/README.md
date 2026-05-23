# Tarini V6 Backend

This folder will contain the FastAPI backend.

Primary responsibilities:
- Auth, RBAC, tenancy, and audit.
- Patient and visit APIs.
- Report upload and processing APIs.
- Workflow, billing, analytics, AI, and copilot APIs.
- Background workers and service integrations.

Architecture references:
- `../docs/tarini-v6-architecture/01_SYSTEM_ARCHITECTURE.md`
- `../docs/tarini-v6-architecture/02_AUTH_RBAC_TENANCY.md`
- `../docs/tarini-v6-architecture/16_DATABASE_AND_DATA_CONTRACTS.md`

## Local Run
From this folder:

```powershell
uvicorn app.main:app --reload
```

Health check:

```text
GET http://127.0.0.1:8000/api/v1/health
```

## Current Skeleton
- App factory in `app/main.py`.
- Health and system info routes in `app/api/routes/health.py`.
- Environment-backed settings in `app/core/config.py`.
- Request ID middleware in `app/core/middleware.py`.

## SQLAlchemy Model Conventions
- Shared SQLAlchemy naming conventions and timestamp helpers are centralized in `app/db/conventions.py` and wired through `app/db/base.py` metadata.
- Existing migration history remains compatible: previously generated revisions (for example `migrations/versions/0001_identity_foundation.py`) are not rewritten, and constraint/index names that were already explicit continue to apply unchanged.
- For future schema changes, generate new Alembic revisions normally so any new unnamed constraints/indexes inherit the shared naming convention.
