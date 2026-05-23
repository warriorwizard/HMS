from fastapi import APIRouter, Request

from app.core.config import settings
from app.core.request_context import get_request_context

router = APIRouter()


@router.get("/health")
def health_check(request: Request) -> dict[str, str]:
    context = get_request_context(request)
    return {
        "status": "ok",
        "service": settings.service_name,
        "environment": settings.environment,
        "version": settings.version,
        "request_id": context.request_id,
        "correlation_id": context.correlation_id,
    }


@router.get("/system/info")
def system_info() -> dict[str, str]:
    return {
        "project": settings.project_name,
        "service": settings.service_name,
        "environment": settings.environment,
        "api_prefix": settings.api_prefix,
        "version": settings.version,
    }
