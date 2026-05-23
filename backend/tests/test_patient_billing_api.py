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


def test_patients_api_flow_and_timeline() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    list_response = asyncio.run(_request("GET", "/api/v1/patients", token=token, params={"q": "asha"}))
    assert list_response.status_code == 200
    list_payload = list_response.json()
    assert list_payload["page"]["total"] >= 1

    create_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/patients",
            token=token,
            json={
                "full_name": "Test Patient",
                "age": 45,
                "sex": "F",
                "primary_condition": "Follow up",
            },
        )
    )
    assert create_response.status_code == 201
    patient = create_response.json()

    visit_response = asyncio.run(
        _request(
            "POST",
            f"/api/v1/patients/{patient['id']}/visits",
            token=token,
            json={
                "visit_type": "Doctor Review",
                "status": "Ready",
                "scheduled_at": "2026-05-23T16:00:00Z",
            },
        )
    )
    assert visit_response.status_code == 201

    timeline_response = asyncio.run(
        _request("GET", f"/api/v1/patients/{patient['id']}/timeline", token=token)
    )
    assert timeline_response.status_code == 200
    timeline_payload = timeline_response.json()
    assert timeline_payload["page"]["total"] >= 2


def test_billing_orders_invoices_and_payments_flow() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    services_response = asyncio.run(_request("GET", "/api/v1/billing/services", token=token))
    assert services_response.status_code == 200
    services_payload = services_response.json()
    assert services_payload["page"]["total"] >= 1

    create_order_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/billing/orders",
            token=token,
            json={
                "patient_id": "pat_001",
                "visit_id": "vis_001",
                "service_id": services_payload["items"][0]["id"],
                "quantity": 2,
                "discount_percent": 10,
                "package_name": "Preventive Bundle",
            },
        )
    )
    assert create_order_response.status_code == 201

    invoices_response = asyncio.run(_request("GET", "/api/v1/billing/invoices", token=token))
    assert invoices_response.status_code == 200
    invoice_id = invoices_response.json()["items"][-1]["id"]

    payment_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/billing/payments",
            token=token,
            json={"invoice_id": invoice_id, "amount": 100.0, "method": "upi"},
        )
    )
    assert payment_response.status_code == 201
    assert payment_response.json()["status"] == "settled"
