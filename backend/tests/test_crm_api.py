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
    params: dict[str, str | int] | None = None,
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


def test_crm_endpoints_require_authentication() -> None:
    _install_test_db()

    for path in (
        "/api/v1/crm/leads",
        "/api/v1/crm/reminders",
        "/api/v1/crm/campaigns",
    ):
        response = asyncio.run(_request("GET", path))
        assert response.status_code == 401
        payload = response.json()
        assert payload["error"]["code"] == "unauthorized"
        assert payload["error"]["message"] == "Missing bearer token"
        assert payload["error"]["details"] == {}


def test_crm_leads_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/crm/leads",
            token=token,
            params={"q": "alpha", "status": "new,qualified", "limit": 1, "offset": 1},
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["lead_004"]
    assert payload["items"][0]["status"] == "qualified"


def test_crm_reminders_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/crm/reminders",
            token=token,
            params={"priority": "high", "status": "pending", "limit": 1, "offset": 1},
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["rem_003"]
    assert payload["items"][0]["priority"] == "high"
    assert payload["items"][0]["status"] == "pending"


def test_crm_campaigns_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/crm/campaigns",
            token=token,
            params={
                "q": "alpha",
                "status": "active",
                "channel": "email",
                "limit": 1,
                "offset": 1,
            },
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["camp_006"]
    assert payload["items"][0]["channel"] == "email"
    assert payload["items"][0]["status"] == "active"
