from fastapi import FastAPI

from app.api.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.middleware import RequestContextMiddleware


def create_app() -> FastAPI:
    configure_logging(settings.log_level)
    app = FastAPI(
        title=settings.project_name,
        version=settings.version,
        description="Healthcare intelligence backend for Tarini V6.",
        docs_url="/docs" if settings.enable_docs else None,
        redoc_url="/redoc" if settings.enable_docs else None,
        openapi_url="/openapi.json" if settings.enable_docs else None,
    )
    app.add_middleware(RequestContextMiddleware)
    app.include_router(api_router, prefix=settings.api_prefix)

    @app.get("/", tags=["system"])
    def root() -> dict[str, str]:
        return {
            "service": settings.service_name,
            "status": "ok",
            "docs": "/docs" if settings.enable_docs else "disabled",
        }

    return app


app = create_app()
