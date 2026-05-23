import asyncio
from collections.abc import Generator

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.modules.identity.models import Membership, Role, Tenant, User
from app.modules.identity.security import hash_password
from app.modules.notifications.service import reset_notifications_store


def _seed_auth_data(session: Session) -> None:
    tenant = Tenant(id="ten_test", name="Test Hospital", slug="test-hospital", status="active")
    role = Role(
        id="role_ops",
        tenant_id="ten_test",
        name="Operations",
        key="ops",
        is_system=False,
        status="active",
    )
    user = User(
        id="usr_ops",
        email="ops@example.com",
        password_hash=hash_password("correct-password"),
        first_name="Casey",
        last_name="Operator",
        status="active",
    )
    membership = Membership(
        id="mem_ops",
        tenant_id="ten_test",
        user_id="usr_ops",
        role_id="role_ops",
        status="active",
    )
    session.add_all([tenant, role, user, membership])
    session.commit()


def _install_test_db() -> None:
    reset_notifications_store()
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory() as session:
        _seed_auth_data(session)

    def override_db() -> Generator[Session, None, None]:
        db = factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db_session] = override_db


async def _request(
    method: str,
    path: str,
    *,
    token: str | None = None,
    params: dict[str, str | int | bool] | None = None,
    json: dict[str, object] | None = None,
) -> httpx.Response:
    headers: dict[str, str] = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.request(
            method=method,
            url=path,
            params=params,
            json=json,
            headers=headers,
        )


def _login_and_get_access_token() -> str:
    response = asyncio.run(
        _request(
            "POST",
            "/api/v1/auth/login",
            json={"email": "ops@example.com", "password": "correct-password"},
        )
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_notification_endpoints_require_authentication() -> None:
    _install_test_db()

    requests = (
        ("GET", "/api/v1/notifications", None),
        (
            "POST",
            "/api/v1/notifications",
            {
                "user_id": "usr_ops",
                "title": "Auth check",
                "message": "Must reject unauthenticated request.",
                "channel": "in_app",
                "status": "queued",
            },
        ),
        ("PATCH", "/api/v1/notifications/ntf_001/read", None),
        (
            "POST",
            "/api/v1/notifications/patient-share/otp",
            {
                "patient_id": "pat_001",
                "recipient": "+14155550123",
                "channel": "sms",
            },
        ),
        (
            "POST",
            "/api/v1/notifications/patient-share/dispatch",
            {
                "share_id": "shr_001",
                "otp_code": "000000",
                "message": "Secure report link",
            },
        ),
    )

    for method, path, payload in requests:
        response = asyncio.run(_request(method, path, json=payload))
        assert response.status_code == 401
        body = response.json()
        assert body["error"]["code"] == "unauthorized"
        assert body["error"]["message"] == "Missing bearer token"
        assert body["error"]["details"] == {}


def test_notifications_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/notifications",
            token=token,
            params={
                "q": "queue",
                "channel": "in_app,email",
                "status": "queued,sent",
                "is_read": False,
                "limit": 1,
                "offset": 0,
            },
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 0, "total": 1}
    assert [item["id"] for item in payload["items"]] == ["ntf_003"]
    assert payload["items"][0]["is_read"] is False


def test_create_notification_and_mark_as_read() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    create_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/notifications",
            token=token,
            json={
                "user_id": "usr_ops",
                "title": "Ops handoff",
                "message": "Daily handoff is due by 17:00.",
                "channel": "in_app",
                "status": "queued",
            },
        )
    )

    assert create_response.status_code == 201
    created = create_response.json()
    assert created["id"] == "ntf_005"
    assert created["is_read"] is False
    assert created["status"] == "queued"

    read_response = asyncio.run(
        _request("PATCH", f"/api/v1/notifications/{created['id']}/read", token=token)
    )
    assert read_response.status_code == 200
    read_payload = read_response.json()
    assert read_payload["id"] == created["id"]
    assert read_payload["is_read"] is True
    assert read_payload["read_at"] is not None


def test_patient_share_otp_and_dispatch_flow() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    otp_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/notifications/patient-share/otp",
            token=token,
            json={
                "patient_id": "pat_123",
                "recipient": "patient@example.com",
                "channel": "email",
            },
        )
    )

    assert otp_response.status_code == 200
    otp_payload = otp_response.json()
    assert otp_payload["share_id"] == "shr_001"
    assert otp_payload["otp_code"] == "730194"
    assert otp_payload["expires_at"] == "2026-05-23T01:00:00Z"

    dispatch_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/notifications/patient-share/dispatch",
            token=token,
            json={
                "share_id": otp_payload["share_id"],
                "otp_code": otp_payload["otp_code"],
                "message": "Report link: https://example.org/r/abc",
            },
        )
    )

    assert dispatch_response.status_code == 200
    dispatch_payload = dispatch_response.json()
    assert dispatch_payload["share_id"] == "shr_001"
    assert dispatch_payload["channel"] == "email"
    assert dispatch_payload["provider"] == "mock-provider"
    assert dispatch_payload["status"] == "sent"

    invalid_otp_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/notifications/patient-share/dispatch",
            token=token,
            json={
                "share_id": "shr_001",
                "otp_code": "000000",
                "message": "Retry should fail after consumption",
            },
        )
    )
    assert invalid_otp_response.status_code == 400
