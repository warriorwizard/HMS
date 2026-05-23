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


def test_lims_sample_collection_and_status_tracking() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    list_response = asyncio.run(_request("GET", "/api/v1/lims/samples", token=token))
    assert list_response.status_code == 200

    create_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/lims/samples",
            token=token,
            json={
                "patient_id": "pat_011",
                "visit_id": "vis_011",
                "sample_type": "serum",
            },
        )
    )
    assert create_response.status_code == 201
    sample_id = create_response.json()["id"]

    patch_response = asyncio.run(
        _request(
            "PATCH",
            f"/api/v1/lims/samples/{sample_id}/status",
            token=token,
            json={"status": "verified", "verified_by": "lab_001"},
        )
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "verified"


def test_ris_order_creation_assignment_and_status_update() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    create_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/ris/orders",
            token=token,
            json={
                "patient_id": "pat_012",
                "visit_id": "vis_012",
                "modality": "ct",
                "body_part": "head",
                "clinical_indication": "Acute severe headache",
            },
        )
    )
    assert create_response.status_code == 201
    order_id = create_response.json()["id"]

    assign_response = asyncio.run(
        _request(
            "PATCH",
            f"/api/v1/ris/orders/{order_id}/assign",
            token=token,
            json={"radiologist_id": "rad_007"},
        )
    )
    assert assign_response.status_code == 200
    assert assign_response.json()["status"] == "assigned"

    status_response = asyncio.run(
        _request(
            "PATCH",
            f"/api/v1/ris/orders/{order_id}/status",
            token=token,
            json={"status": "reported"},
        )
    )
    assert status_response.status_code == 200
    assert status_response.json()["status"] == "reported"


def test_pacs_study_listing_upload_and_signed_access() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    studies_response = asyncio.run(_request("GET", "/api/v1/pacs/studies", token=token))
    assert studies_response.status_code == 200

    upload_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/pacs/uploads",
            token=token,
            json={
                "patient_id": "pat_013",
                "order_id": "img_013",
                "study_uid": "1.2.840.10008.1.2.1.3013",
                "file_name": "ct-head.dcm",
            },
        )
    )
    assert upload_response.status_code == 201
    payload = upload_response.json()
    assert payload["upload_url"].startswith("https://dicom-storage.example.local/upload/")

    signed_response = asyncio.run(
        _request(
            "GET",
            f"/api/v1/pacs/files/{payload['file_id']}/signed-url",
            token=token,
        )
    )
    assert signed_response.status_code == 200
    assert signed_response.json()["access_url"].startswith("https://dicom-storage.example.local/access/")
