import asyncio
from collections.abc import Generator

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.modules.identity.models import Membership, Permission, Role, RolePermission, Tenant, User
from app.modules.identity.security import hash_password


def _seed_data(session: Session) -> None:
    tenant = Tenant(id="ten_audit", name="Audit Hospital", slug="audit-hospital")
    role = Role(id="role_audit_admin", tenant_id="ten_audit", name="Admin", key="admin", is_system=True)
    perm = Permission(id="perm_audit_read", key="audit:read", resource="audit", action="read")
    role_perm = RolePermission(role_id="role_audit_admin", permission_id="perm_audit_read")
    user = User(
        id="usr_audit",
        email="auditor@example.com",
        password_hash=hash_password("correct-password"),
        first_name="Audit",
        last_name="User",
    )
    membership = Membership(
        id="mem_audit", tenant_id="ten_audit", user_id="usr_audit", role_id="role_audit_admin"
    )
    session.add_all([tenant, role, perm, role_perm, user, membership])
    session.commit()


def _install_test_db() -> sessionmaker[Session]:
    engine = create_engine(
        "sqlite+pysqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory() as session:
        _seed_data(session)

    def override_db() -> Generator[Session, None, None]:
        db = factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db_session] = override_db
    return factory


async def _post(path: str, payload: dict, token: str | None = None) -> httpx.Response:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.post(path, json=payload, headers=headers)


async def _get(path: str, token: str | None = None, params: dict | None = None) -> httpx.Response:
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get(path, headers=headers, params=params)


def _login_and_select_tenant() -> tuple[str, str]:
    login = asyncio.run(_post("/api/v1/auth/login", {"email": "auditor@example.com", "password": "correct-password"}))
    assert login.status_code == 200
    refresh_token = login.json()["refresh_token"]
    access_token = login.json()["access_token"]

    select = asyncio.run(_post("/api/v1/auth/select-tenant", {"refresh_token": refresh_token, "tenant_id": "ten_audit"}))
    assert select.status_code == 200
    scoped_token = select.json()["access_token"]
    return access_token, scoped_token


def test_login_writes_audit_event() -> None:
    _install_test_db()
    access_token, scoped_token = _login_and_select_tenant()

    response = asyncio.run(_get("/api/v1/audit/events", token=scoped_token))
    assert response.status_code == 200
    payload = response.json()
    actions = [item["action"] for item in payload["items"]]
    assert "auth.login" in actions


def test_tenant_selection_writes_audit_event() -> None:
    _install_test_db()
    _, scoped_token = _login_and_select_tenant()

    response = asyncio.run(
        _get("/api/v1/audit/events", token=scoped_token, params={"action": "auth.tenant_selected"})
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["page"]["total"] >= 1
    assert all(item["action"] == "auth.tenant_selected" for item in payload["items"])
    assert payload["items"][0]["tenant_id"] == "ten_audit"


def test_audit_events_requires_auth() -> None:
    _install_test_db()

    response = asyncio.run(_get("/api/v1/audit/events"))
    assert response.status_code == 401


def test_audit_events_pagination() -> None:
    _install_test_db()
    _, scoped_token = _login_and_select_tenant()

    response = asyncio.run(
        _get("/api/v1/audit/events", token=scoped_token, params={"limit": 1, "offset": 0})
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["page"]["limit"] == 1
    assert len(payload["items"]) == 1
    assert payload["page"]["total"] >= 2
