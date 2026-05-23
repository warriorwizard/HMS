# Tarini V6 Local Development

## Prerequisites
- Node.js and npm.
- Python 3.10 or newer.
- PostgreSQL and Redis later through Docker Compose.

## Install Frontend Dependencies
From `frontend`:

```powershell
npm install
```

## Run Frontend
From `frontend`:

```powershell
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

```text
http://127.0.0.1:3000
```

## Run Backend
From `backend`:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:

```text
http://127.0.0.1:8000/api/v1/health
```

API docs:

```text
http://127.0.0.1:8000/docs
```

## Environment Files
Use the example files as templates:

- `.env.example`
- `backend/.env.example`
- `frontend/.env.example`

Do not commit real `.env` files.

## Run Local Data Services
From `infra/local`:

```powershell
docker compose up -d
```

This starts:

- PostgreSQL with pgvector on `127.0.0.1:5432`.
- Redis on `127.0.0.1:6379`.

## Verification Commands
Frontend:

```powershell
npm run lint
npm run build
```

Backend:

```powershell
python -m compileall app
python -c "from app.main import app; print(app.title)"
$env:PYTEST_DISABLE_PLUGIN_AUTOLOAD = "1"
python -m pytest
```

Database migrations:

```powershell
alembic upgrade head
```

All local smoke checks:

```powershell
.\scripts\verify-local.ps1
```

## Project Status
Current implementation status is tracked in:

- `project-tracker/STATUS_BOARD.md`
- `project-tracker/CURRENT_WORK.md`
- `project-tracker/BACKLOG.md`
