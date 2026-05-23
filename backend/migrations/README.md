# Database Migrations

Tarini V6 uses Alembic for database migrations.

## Create A Migration
From `backend`:

```powershell
alembic revision --autogenerate -m "describe change"
```

## Apply Migrations
From `backend`:

```powershell
alembic upgrade head
```

## Notes
- SQLAlchemy metadata is defined from `app/db/base.py`.
- Import ORM models in `app/db/models.py` so Alembic can discover them.
- Database URL is read from `TARINI_DATABASE_URL`.

