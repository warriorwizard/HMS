import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    project_name: str = os.getenv("TARINI_PROJECT_NAME", "Tarini V6")
    service_name: str = os.getenv("TARINI_SERVICE_NAME", "tarini-backend")
    environment: str = os.getenv("TARINI_ENVIRONMENT", "local")
    version: str = os.getenv("TARINI_VERSION", "0.1.0")
    api_prefix: str = os.getenv("TARINI_API_PREFIX", "/api/v1")
    enable_docs: bool = os.getenv("TARINI_ENABLE_DOCS", "true").lower() == "true"
    log_level: str = os.getenv("TARINI_LOG_LEVEL", "INFO")
    database_url: str = os.getenv(
        "TARINI_DATABASE_URL",
        "postgresql+psycopg://tarini:tarini@127.0.0.1:5432/tarini",
    )
    redis_url: str = os.getenv("TARINI_REDIS_URL", "redis://127.0.0.1:6379/0")
    cors_origins: str = os.getenv(
        "TARINI_CORS_ORIGINS",
        "http://127.0.0.1:3000,http://localhost:3000",
    )
    secret_key: str = os.getenv("TARINI_SECRET_KEY", "local-development-secret")
    access_token_minutes: int = int(os.getenv("TARINI_ACCESS_TOKEN_MINUTES", "30"))
    refresh_token_days: int = int(os.getenv("TARINI_REFRESH_TOKEN_DAYS", "14"))


settings = Settings()
