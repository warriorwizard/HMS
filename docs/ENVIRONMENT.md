# Tarini V6 Environment Configuration

## Purpose
This document defines environment variable conventions for local development and future deployment.

## Files
- `.env.example`: root reference values.
- `backend/.env.example`: backend-specific variables.
- `frontend/.env.example`: frontend-specific public variables.

## Naming
Backend variables use:

```text
TARINI_*
```

Frontend browser-exposed variables use:

```text
NEXT_PUBLIC_TARINI_*
```

Never put secrets in `NEXT_PUBLIC_*` variables.

## Local Defaults
- Backend: `http://127.0.0.1:8000`
- Frontend: `http://127.0.0.1:3000`
- Postgres: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`

## Security Rules
- Do not commit `.env` files.
- Do not commit real API keys or database passwords.
- Keep production secrets in a secret manager.
- Keep PHI and PII out of logs and environment values.

## Required Backend Variables
- `TARINI_PROJECT_NAME`
- `TARINI_SERVICE_NAME`
- `TARINI_ENVIRONMENT`
- `TARINI_VERSION`
- `TARINI_API_PREFIX`
- `TARINI_ENABLE_DOCS`
- `TARINI_DATABASE_URL`
- `TARINI_REDIS_URL`
- `TARINI_SECRET_KEY`

## Required Frontend Variables
- `NEXT_PUBLIC_TARINI_APP_NAME`
- `NEXT_PUBLIC_TARINI_ENVIRONMENT`
- `NEXT_PUBLIC_TARINI_API_BASE_URL`

