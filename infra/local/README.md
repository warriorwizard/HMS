# Local Infrastructure

This folder will contain local development infrastructure such as Docker Compose for PostgreSQL and Redis.

## Services
- PostgreSQL 16 with pgvector.
- Redis 7.

## Start
From this folder:

```powershell
docker compose up -d
```

## Stop
From this folder:

```powershell
docker compose down
```

## Connection Strings
PostgreSQL:

```text
postgresql+psycopg://tarini:tarini@127.0.0.1:5432/tarini
```

Redis:

```text
redis://127.0.0.1:6379/0
```

## Notes
The PostgreSQL image includes pgvector so the Clinical Memory Engine can use vector search during MVP development.
