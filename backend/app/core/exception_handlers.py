from collections.abc import Mapping
from http import HTTPStatus
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

_STATUS_CODE_TO_ERROR_CODE: dict[int, str] = {
    400: "bad_request",
    401: "unauthorized",
    403: "permission_denied",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    422: "validation_error",
    429: "rate_limited",
    500: "internal_server_error",
}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(
        request: Request,
        exc: StarletteHTTPException,
    ) -> JSONResponse:
        status_code = exc.status_code
        code = _status_error_code(status_code)
        message = _status_message(status_code)
        details: dict[str, object] = {}
        detail = exc.detail

        if isinstance(detail, str):
            message = detail
        elif isinstance(detail, Mapping):
            detail_code = detail.get("code")
            detail_message = detail.get("message")
            detail_details = detail.get("details")

            if isinstance(detail_code, str) and detail_code:
                code = detail_code
            if isinstance(detail_message, str) and detail_message:
                message = detail_message
            elif isinstance(detail.get("detail"), str) and detail["detail"]:
                message = detail["detail"]

            if isinstance(detail_details, Mapping):
                details = dict(detail_details)
            elif detail_details is not None:
                details = {"detail": detail_details}

        elif detail is not None:
            details = {"detail": detail}

        return _error_response(
            request=request,
            status_code=status_code,
            code=code,
            message=message,
            details=details,
        )

    @app.exception_handler(RequestValidationError)
    async def handle_request_validation_error(
        request: Request,
        exc: RequestValidationError,
    ) -> JSONResponse:
        return _error_response(
            request=request,
            status_code=422,
            code="validation_error",
            message="Request validation failed.",
            details={"errors": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def handle_unexpected_exception(
        request: Request,
        _: Exception,
    ) -> JSONResponse:
        return _error_response(
            request=request,
            status_code=500,
            code="internal_server_error",
            message="An unexpected error occurred.",
            details={},
        )


def _error_response(
    *,
    request: Request,
    status_code: int,
    code: str,
    message: str,
    details: dict[str, object],
) -> JSONResponse:
    request_id = _request_id_from_request(request)
    correlation_id = _correlation_id_from_request(request)
    payload = {
        "error": {
            "code": code,
            "message": message,
            "request_id": request_id,
            "details": details,
        }
    }
    response = JSONResponse(status_code=status_code, content=payload)
    response.headers["x-request-id"] = request_id
    if correlation_id:
        response.headers["x-correlation-id"] = correlation_id
    return response


def _request_id_from_request(request: Request) -> str:
    request_id = getattr(request.state, "request_id", None)
    if isinstance(request_id, str) and request_id:
        return request_id

    context = getattr(request.state, "request_context", None)
    context_request_id = getattr(context, "request_id", None)
    if isinstance(context_request_id, str) and context_request_id:
        return context_request_id

    return f"req_{uuid4().hex}"


def _correlation_id_from_request(request: Request) -> str | None:
    context = getattr(request.state, "request_context", None)
    context_correlation_id = getattr(context, "correlation_id", None)
    if isinstance(context_correlation_id, str) and context_correlation_id:
        return context_correlation_id

    header_correlation_id = request.headers.get("x-correlation-id")
    if isinstance(header_correlation_id, str) and header_correlation_id:
        return header_correlation_id

    return None


def _status_error_code(status_code: int) -> str:
    return _STATUS_CODE_TO_ERROR_CODE.get(status_code, "http_error")


def _status_message(status_code: int) -> str:
    try:
        return HTTPStatus(status_code).phrase
    except ValueError:
        return "Request failed."
