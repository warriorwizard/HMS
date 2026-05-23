import asyncio
from collections.abc import Generator

import httpx
from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.db.session import get_db_session
from app.main import app
from app.modules.identity.dependencies import require_permission
from app.modules.identity.models import (
    Membership,
    Permission,
    Role,
    RolePermission,
    Tenant,
    User,
)
from app.modules.identity.security import hash_password
from app.modules.identity.service import AuthenticatedIdentity


@app.get("/api/v1/test-auth/patients-read")
def _patients_read_probe(
    identity: AuthenticatedIdentity = Depends(require_permission("patients:read")),
) -> dict[str, object]:
    return {
        "user_id": identity.user.id,
        "tenant_id": identity.tenant_id,
        "permissions": list(identity.permissions),
    }


def _seed_auth_data(session: Session) -> None:
    tenant = Tenant(id="ten_test", name="Test Hospital", slug="test-hospital")
    role = Role(
        id="role_doctor",
        tenant_id="ten_test",
        name="Doctor",
        key="doctor",
        is_system=True,
    )
    permission = Permission(
        id="perm_patients_read",
        key="patients:read",
        resource="patients",
        action="read",
        description="Read patient records",
    )
    role_permission = RolePermission(
        role_id="role_doctor",
        permission_id="perm_patients_read",
    )
    user = User(
        id="usr_doctor",
        email="doctor@example.com",
        password_hash=hash_password("correct-password"),
        first_name="Demo",
        last_name="Doctor",
    )
    membership = Membership(
        id="mem_doctor",
        tenant_id="ten_test",
        user_id="usr_doctor",
        role_id="role_doctor",
    )
    session.add_all([tenant, role, permission, role_permission, user, membership])
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
        _seed_auth_data(session)

    def override_db() -> Generator[Session, None, None]:
        db = factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db_session] = override_db
    return factory


async def _post_json(path: str, payload: dict) -> httpx.Response:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.post(path, json=payload)


async def _get_json(path: str, access_token: str) -> httpx.Response:
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        return await client.get(
            path,
            headers={"Authorization": f"Bearer {access_token}"},
        )


def test_login_me_refresh_and_logout_flow() -> None:
    _install_test_db()

    login_response = asyncio.run(
        _post_json(
            "/api/v1/auth/login",
            {"email": "doctor@example.com", "password": "correct-password"},
        )
    )
    assert login_response.status_code == 200
    login_payload = login_response.json()
    assert login_payload["token_type"] == "bearer"
    assert login_payload["user"]["email"] == "doctor@example.com"
    assert login_payload["user"]["memberships"][0]["tenant_id"] == "ten_test"
    assert login_payload["user"]["selected_tenant"] is None
    assert login_payload["user"]["permissions"] == []

    transport = httpx.ASGITransport(app=app)

    async def request_me() -> httpx.Response:
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as client:
            return await client.get(
                "/api/v1/auth/me",
                headers={"Authorization": f"Bearer {login_payload['access_token']}"},
            )

    me_response = asyncio.run(request_me())
    assert me_response.status_code == 200
    assert me_response.json()["id"] == "usr_doctor"

    refresh_response = asyncio.run(
        _post_json(
            "/api/v1/auth/refresh",
            {"refresh_token": login_payload["refresh_token"]},
        )
    )
    assert refresh_response.status_code == 200
    assert refresh_response.json()["access_token"]

    logout_response = asyncio.run(
        _post_json(
            "/api/v1/auth/logout",
            {"refresh_token": login_payload["refresh_token"]},
        )
    )
    assert logout_response.status_code == 200

    rejected_refresh = asyncio.run(
        _post_json(
            "/api/v1/auth/refresh",
            {"refresh_token": login_payload["refresh_token"]},
        )
    )
    assert rejected_refresh.status_code == 401


def test_login_rejects_wrong_password() -> None:
    _install_test_db()

    response = asyncio.run(
        _post_json(
            "/api/v1/auth/login",
            {"email": "doctor@example.com", "password": "wrong-password"},
        )
    )

    assert response.status_code == 401


def test_select_tenant_returns_scoped_access_token_and_refresh_preserves_it() -> None:
    _install_test_db()

    login_response = asyncio.run(
        _post_json(
            "/api/v1/auth/login",
            {"email": "doctor@example.com", "password": "correct-password"},
        )
    )
    assert login_response.status_code == 200
    login_payload = login_response.json()

    select_response = asyncio.run(
        _post_json(
            "/api/v1/auth/select-tenant",
            {
                "refresh_token": login_payload["refresh_token"],
                "tenant_id": "ten_test",
            },
        )
    )
    assert select_response.status_code == 200
    select_payload = select_response.json()
    assert select_payload["token_type"] == "bearer"
    assert select_payload["selected_tenant"] == {
        "tenant_id": "ten_test",
        "role_id": "role_doctor",
        "role_key": "doctor",
        "site_id": None,
        "department_id": None,
        "permissions": ["patients:read"],
    }

    me_response = asyncio.run(
        _get_json("/api/v1/auth/me", select_payload["access_token"])
    )
    assert me_response.status_code == 200
    me_payload = me_response.json()
    assert me_payload["selected_tenant"]["tenant_id"] == "ten_test"
    assert me_payload["selected_tenant"]["permissions"] == ["patients:read"]
    assert me_payload["permissions"] == ["patients:read"]

    refresh_response = asyncio.run(
        _post_json(
            "/api/v1/auth/refresh",
            {"refresh_token": login_payload["refresh_token"]},
        )
    )
    assert refresh_response.status_code == 200

    refreshed_me_response = asyncio.run(
        _get_json("/api/v1/auth/me", refresh_response.json()["access_token"])
    )
    assert refreshed_me_response.status_code == 200
    assert refreshed_me_response.json()["selected_tenant"]["tenant_id"] == "ten_test"


def test_select_tenant_rejects_missing_membership() -> None:
    _install_test_db()

    login_response = asyncio.run(
        _post_json(
            "/api/v1/auth/login",
            {"email": "doctor@example.com", "password": "correct-password"},
        )
    )
    assert login_response.status_code == 200

    select_response = asyncio.run(
        _post_json(
            "/api/v1/auth/select-tenant",
            {
                "refresh_token": login_response.json()["refresh_token"],
                "tenant_id": "ten_missing",
            },
        )
    )

    assert select_response.status_code == 403


def test_permission_helper_allows_scoped_permission_and_blocks_unscoped_token() -> None:
    _install_test_db()

    login_response = asyncio.run(
        _post_json(
            "/api/v1/auth/login",
            {"email": "doctor@example.com", "password": "correct-password"},
        )
    )
    assert login_response.status_code == 200
    login_payload = login_response.json()

    unscoped_response = asyncio.run(
        _get_json("/api/v1/test-auth/patients-read", login_payload["access_token"])
    )
    assert unscoped_response.status_code == 403

    select_response = asyncio.run(
        _post_json(
            "/api/v1/auth/select-tenant",
            {
                "refresh_token": login_payload["refresh_token"],
                "tenant_id": "ten_test",
            },
        )
    )
    assert select_response.status_code == 200

    scoped_response = asyncio.run(
        _get_json(
            "/api/v1/test-auth/patients-read",
            select_response.json()["access_token"],
        )
    )

    assert scoped_response.status_code == 200
    assert scoped_response.json() == {
        "user_id": "usr_doctor",
        "tenant_id": "ten_test",
        "permissions": ["patients:read"],
    }
