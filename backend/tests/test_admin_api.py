import asyncio
from collections.abc import Generator

import httpx
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.modules.identity.models import (
    Department,
    Membership,
    Permission,
    Role,
    RolePermission,
    Tenant,
    TenantSite,
    User,
)
from app.modules.identity.security import hash_password


def _seed_admin_data(session: Session) -> None:
    tenants = [
        Tenant(id="ten_alpha", name="Alpha Health", slug="alpha-health", status="active"),
        Tenant(id="ten_beta", name="Beta Labs", slug="beta-labs", status="inactive"),
        Tenant(id="ten_gamma", name="Gamma Care", slug="gamma-care", status="active"),
    ]

    sites = [
        TenantSite(id="site_a1", tenant_id="ten_alpha", name="Alpha Main", code="ALPHA-MAIN"),
        TenantSite(id="site_a2", tenant_id="ten_alpha", name="Alpha East", code="ALPHA-EAST"),
        TenantSite(id="site_b1", tenant_id="ten_beta", name="Beta Main", code="BETA-MAIN"),
    ]

    departments = [
        Department(
            id="dept_a1",
            tenant_id="ten_alpha",
            site_id="site_a1",
            name="Radiology",
            code="RAD",
        ),
        Department(
            id="dept_a2",
            tenant_id="ten_alpha",
            site_id="site_a1",
            name="Pathology",
            code="PATH",
        ),
        Department(
            id="dept_a3",
            tenant_id="ten_alpha",
            site_id="site_a2",
            name="Emergency",
            code="ER",
        ),
        Department(
            id="dept_b1",
            tenant_id="ten_beta",
            site_id="site_b1",
            name="Diagnostics",
            code="DIAG",
        ),
    ]

    roles = [
        Role(
            id="role_alpha_admin",
            tenant_id="ten_alpha",
            name="Alpha Admin",
            key="tenant_admin",
            is_system=True,
            status="active",
        ),
        Role(
            id="role_alpha_viewer",
            tenant_id="ten_alpha",
            name="Alpha Viewer",
            key="viewer",
            is_system=False,
            status="active",
        ),
        Role(
            id="role_beta_admin",
            tenant_id="ten_beta",
            name="Beta Admin",
            key="tenant_admin",
            is_system=True,
            status="active",
        ),
    ]

    permissions = [
        Permission(
            id="perm_patients_read",
            key="patients:read",
            resource="patients",
            action="read",
        ),
        Permission(
            id="perm_patients_write",
            key="patients:write",
            resource="patients",
            action="write",
        ),
        Permission(
            id="perm_reports_read",
            key="reports:read",
            resource="reports",
            action="read",
        ),
    ]

    role_permissions = [
        RolePermission(role_id="role_alpha_admin", permission_id="perm_patients_read"),
        RolePermission(role_id="role_alpha_admin", permission_id="perm_patients_write"),
        RolePermission(role_id="role_alpha_viewer", permission_id="perm_patients_read"),
        RolePermission(role_id="role_beta_admin", permission_id="perm_patients_read"),
        RolePermission(role_id="role_beta_admin", permission_id="perm_patients_write"),
        RolePermission(role_id="role_beta_admin", permission_id="perm_reports_read"),
    ]

    users = [
        User(
            id="usr_admin",
            email="admin@example.com",
            password_hash=hash_password("correct-password"),
            first_name="Alice",
            last_name="Admin",
            status="active",
        ),
        User(
            id="usr_anna",
            email="anna@example.com",
            password_hash=hash_password("correct-password"),
            first_name="Anna",
            last_name="Analyst",
            status="active",
        ),
        User(
            id="usr_bob",
            email="bob@example.com",
            password_hash=hash_password("correct-password"),
            first_name="Bob",
            last_name="Builder",
            status="active",
        ),
        User(
            id="usr_cara",
            email="cara@example.com",
            password_hash=hash_password("correct-password"),
            first_name="Cara",
            last_name="Clinician",
            status="active",
        ),
    ]

    memberships = [
        Membership(
            id="mem_admin",
            tenant_id="ten_alpha",
            user_id="usr_admin",
            role_id="role_alpha_admin",
            status="active",
        ),
        Membership(
            id="mem_anna",
            tenant_id="ten_alpha",
            user_id="usr_anna",
            role_id="role_alpha_viewer",
            status="active",
        ),
        Membership(
            id="mem_bob",
            tenant_id="ten_alpha",
            user_id="usr_bob",
            role_id="role_alpha_admin",
            status="inactive",
        ),
        Membership(
            id="mem_cara",
            tenant_id="ten_beta",
            user_id="usr_cara",
            role_id="role_beta_admin",
            status="active",
        ),
    ]

    session.add_all(tenants + sites + departments + roles + permissions + role_permissions + users + memberships)
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
        _seed_admin_data(session)

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
            json={"email": "admin@example.com", "password": "correct-password"},
        )
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def test_admin_tenants_contract_filters_and_pagination() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    response = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/tenants",
            token=token,
            params={"q": "alpha", "limit": 1, "offset": 0},
        )
    )
    assert response.status_code == 200
    payload = response.json()
    assert payload["page"] == {"limit": 1, "offset": 0, "total": 1}
    assert payload["items"] == [
        {
            "id": "ten_alpha",
            "name": "Alpha Health",
            "slug": "alpha-health",
            "status": "active",
            "site_count": 2,
            "department_count": 3,
        }
    ]

    status_response = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/tenants",
            token=token,
            params={"status": "inactive"},
        )
    )
    assert status_response.status_code == 200
    status_payload = status_response.json()
    assert status_payload["page"]["total"] == 1
    assert [item["id"] for item in status_payload["items"]] == ["ten_beta"]


def test_admin_memberships_contract_filters_and_pagination() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    paged = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/memberships",
            token=token,
            params={"limit": 2, "offset": 1},
        )
    )
    assert paged.status_code == 200
    paged_payload = paged.json()
    assert paged_payload["page"] == {"limit": 2, "offset": 1, "total": 4}
    assert len(paged_payload["items"]) == 2

    q_filtered = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/memberships",
            token=token,
            params={"q": "anna"},
        )
    )
    assert q_filtered.status_code == 200
    q_payload = q_filtered.json()
    assert q_payload["page"]["total"] == 1
    assert q_payload["items"][0]["id"] == "mem_anna"
    assert q_payload["items"][0]["permission_count"] == 1
    assert q_payload["items"][0]["user"] == {
        "id": "usr_anna",
        "email": "anna@example.com",
        "first_name": "Anna",
        "last_name": "Analyst",
        "status": "active",
    }
    assert q_payload["items"][0]["tenant"] == {
        "id": "ten_alpha",
        "name": "Alpha Health",
        "slug": "alpha-health",
        "status": "active",
    }
    assert q_payload["items"][0]["role"] == {
        "id": "role_alpha_viewer",
        "key": "viewer",
        "name": "Alpha Viewer",
        "status": "active",
    }

    status_filtered = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/memberships",
            token=token,
            params={"status": "inactive"},
        )
    )
    assert status_filtered.status_code == 200
    assert [item["id"] for item in status_filtered.json()["items"]] == ["mem_bob"]

    tenant_filtered = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/memberships",
            token=token,
            params={"tenant_id": "ten_beta"},
        )
    )
    assert tenant_filtered.status_code == 200
    assert [item["id"] for item in tenant_filtered.json()["items"]] == ["mem_cara"]

    role_filtered = asyncio.run(
        _request(
            "GET",
            "/api/v1/admin/memberships",
            token=token,
            params={"role_key": "viewer"},
        )
    )
    assert role_filtered.status_code == 200
    assert [item["id"] for item in role_filtered.json()["items"]] == ["mem_anna"]
