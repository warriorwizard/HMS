import asyncio
from collections.abc import Generator

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.modules.b2b.service import reset_b2b_order_store
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
    reset_b2b_order_store()
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


def test_b2b_endpoints_require_authentication() -> None:
    _install_test_db()

    requests = (
        ("GET", "/api/v1/b2b/partners", None),
        ("GET", "/api/v1/b2b/pricing-rules", None),
        ("GET", "/api/v1/b2b/orders", None),
        (
            "POST",
            "/api/v1/b2b/orders",
            {
                "partner_id": "partner_002",
                "po_number": "PO-NOAUTH-001",
                "status": "open",
                "total_amount": 1750.0,
                "currency": "USD",
            },
        ),
        ("GET", "/api/v1/b2b/billing-summary", None),
    )

    for method, path, json_payload in requests:
        response = asyncio.run(_request(method, path, json=json_payload))
        assert response.status_code == 401
        payload = response.json()
        assert payload["error"]["code"] == "unauthorized"
        assert payload["error"]["message"] == "Missing bearer token"
        assert payload["error"]["details"] == {}


def test_b2b_partners_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/b2b/partners",
            token=token,
            params={"q": "alpha", "status": "active", "limit": 1, "offset": 1},
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["partner_005"]
    assert payload["items"][0]["status"] == "active"


def test_b2b_pricing_rules_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/b2b/pricing-rules",
            token=token,
            params={"partner_id": "partner_001", "status": "active", "limit": 1, "offset": 1},
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["rule_006"]
    assert payload["items"][0]["partner_id"] == "partner_001"
    assert payload["items"][0]["status"] == "active"


def test_b2b_orders_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/b2b/orders",
            token=token,
            params={
                "q": "PO-ALPHA",
                "status": "open",
                "partner_id": "partner_001",
                "limit": 1,
                "offset": 1,
            },
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["ord_004"]
    assert payload["items"][0]["status"] == "open"
    assert payload["items"][0]["partner_id"] == "partner_001"


def test_b2b_billing_summary_filters_and_pagination_metadata() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/b2b/billing-summary",
            token=token,
            params={"partner_id": "partner_001", "status": "due", "limit": 1, "offset": 1},
        )
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload["page"]) == {"limit", "offset", "total"}
    assert payload["page"] == {"limit": 1, "offset": 1, "total": 2}
    assert [item["id"] for item in payload["items"]] == ["bill_005"]
    assert payload["items"][0]["status"] == "due"
    assert payload["items"][0]["partner_id"] == "partner_001"


def test_b2b_orders_create_and_subsequent_list_include_new_order() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    create_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/b2b/orders",
            token=token,
            json={
                "partner_id": "partner_002",
                "po_number": "PO-NEW-900",
                "status": "open",
                "total_amount": 4200.5,
                "currency": "USD",
            },
        )
    )

    assert create_response.status_code == 201
    created_order = create_response.json()
    assert created_order["id"] == "ord_006"
    assert created_order["partner_id"] == "partner_002"
    assert created_order["status"] == "open"
    assert created_order["po_number"] == "PO-NEW-900"

    list_response = asyncio.run(
        _request(
            "GET",
            "/api/v1/b2b/orders",
            token=token,
            params={"q": "PO-NEW-900", "status": "open", "partner_id": "partner_002"},
        )
    )

    assert list_response.status_code == 200
    payload = list_response.json()
    assert payload["page"] == {"limit": 25, "offset": 0, "total": 1}
    assert [item["id"] for item in payload["items"]] == [created_order["id"]]
    assert payload["items"][0]["po_number"] == "PO-NEW-900"
