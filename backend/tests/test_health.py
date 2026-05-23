import asyncio

import httpx

from app.main import app


def test_health_endpoint_returns_request_context() -> None:
    async def request_health() -> httpx.Response:
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            return await client.get(
                "/api/v1/health",
                headers={
                    "x-request-id": "req_smoke_test",
                    "x-correlation-id": "corr_smoke_test",
                },
            )

    response = asyncio.run(request_health())

    assert response.status_code == 200
    assert response.headers["x-request-id"] == "req_smoke_test"
    assert response.headers["x-correlation-id"] == "corr_smoke_test"
    assert "x-response-time-ms" in response.headers
    assert response.json() == {
        "status": "ok",
        "service": "tarini-backend",
        "environment": "local",
        "version": "0.1.0",
        "request_id": "req_smoke_test",
        "correlation_id": "corr_smoke_test",
    }
