import asyncio

import httpx
from fastapi import HTTPException
from pydantic import BaseModel

from app.main import app


class _ValidationPayload(BaseModel):
    age: int


def _install_error_contract_test_routes() -> None:
    existing_paths = {route.path for route in app.router.routes}
    if "/api/v1/test-error-contract/http-exception" not in existing_paths:

        @app.get("/api/v1/test-error-contract/http-exception")
        def _raise_http_exception() -> None:
            raise HTTPException(status_code=403, detail="Permission denied")

    if "/api/v1/test-error-contract/validation" not in existing_paths:

        @app.post("/api/v1/test-error-contract/validation")
        def _validation_endpoint(payload: _ValidationPayload) -> dict[str, int]:
            return payload.model_dump()

    if "/api/v1/test-error-contract/unhandled" not in existing_paths:

        @app.get("/api/v1/test-error-contract/unhandled")
        def _raise_unhandled_exception() -> None:
            raise RuntimeError("Unexpected failure for error contract test")


async def _request(
    method: str,
    path: str,
    *,
    json: dict[str, object] | None = None,
    headers: dict[str, str] | None = None,
) -> httpx.Response:
    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.request(method=method, url=path, json=json, headers=headers)


def test_http_exception_uses_standard_error_envelope() -> None:
    _install_error_contract_test_routes()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/test-error-contract/http-exception",
            headers={
                "x-request-id": "req_http_exception_contract",
                "x-correlation-id": "corr_http_exception_contract",
            },
        )
    )

    assert response.status_code == 403
    assert response.headers["x-request-id"] == "req_http_exception_contract"
    assert response.headers["x-correlation-id"] == "corr_http_exception_contract"
    assert response.json() == {
        "error": {
            "code": "permission_denied",
            "message": "Permission denied",
            "request_id": "req_http_exception_contract",
            "details": {},
        }
    }


def test_validation_errors_use_standard_error_envelope() -> None:
    _install_error_contract_test_routes()

    response = asyncio.run(
        _request(
            "POST",
            "/api/v1/test-error-contract/validation",
            json={"age": "not-a-number"},
            headers={
                "x-request-id": "req_validation_contract",
                "x-correlation-id": "corr_validation_contract",
            },
        )
    )

    assert response.status_code == 422
    assert response.headers["x-request-id"] == "req_validation_contract"
    assert response.headers["x-correlation-id"] == "corr_validation_contract"

    payload = response.json()
    assert payload["error"]["code"] == "validation_error"
    assert payload["error"]["message"] == "Request validation failed."
    assert payload["error"]["request_id"] == "req_validation_contract"
    assert isinstance(payload["error"]["details"], dict)
    assert isinstance(payload["error"]["details"]["errors"], list)
    assert payload["error"]["details"]["errors"]


def test_unhandled_exceptions_use_standard_error_envelope() -> None:
    _install_error_contract_test_routes()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/test-error-contract/unhandled",
            headers={
                "x-request-id": "req_unhandled_contract",
                "x-correlation-id": "corr_unhandled_contract",
            },
        )
    )

    assert response.status_code == 500
    assert response.headers["x-request-id"] == "req_unhandled_contract"
    assert response.headers["x-correlation-id"] == "corr_unhandled_contract"
    assert response.json() == {
        "error": {
            "code": "internal_server_error",
            "message": "An unexpected error occurred.",
            "request_id": "req_unhandled_contract",
            "details": {},
        }
    }
