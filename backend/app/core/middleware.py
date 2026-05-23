import logging
import time
from uuid import uuid4

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings
from app.core.request_context import RequestContext

request_logger = logging.getLogger("tarini.request")


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("x-request-id", f"req_{uuid4().hex}")
        correlation_id = request.headers.get("x-correlation-id", f"corr_{uuid4().hex}")
        request.state.request_id = request_id
        request.state.request_context = RequestContext(
            request_id=request_id,
            correlation_id=correlation_id,
            tenant_id=request.headers.get("x-tenant-id"),
            site_id=request.headers.get("x-site-id"),
        )
        start_time = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            request_logger.exception(
                "request_failed",
                extra={
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "service": settings.service_name,
                    "environment": settings.environment,
                },
            )
            raise

        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["x-request-id"] = request_id
        response.headers["x-correlation-id"] = correlation_id
        response.headers["x-response-time-ms"] = str(duration_ms)
        request_logger.info(
            "request_completed",
            extra={
                "request_id": request_id,
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
                "service": settings.service_name,
                "environment": settings.environment,
            },
        )
        return response
