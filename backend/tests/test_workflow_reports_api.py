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


def test_workflow_queue_and_transition_flow() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    tasks_response = asyncio.run(_request("GET", "/api/v1/workflow/tasks", token=token))
    assert tasks_response.status_code == 200
    tasks_payload = tasks_response.json()
    assert tasks_payload["page"]["total"] >= 1

    task_id = tasks_payload["items"][0]["id"]

    transition_response = asyncio.run(
        _request(
            "POST",
            f"/api/v1/workflow/tasks/{task_id}/transition",
            token=token,
            json={
                "next_stage": "doctor_review",
                "next_status": "ready",
                "comment": "Escalated for physician sign-off",
            },
        )
    )
    assert transition_response.status_code == 200
    assert transition_response.json()["stage"] == "doctor_review"

    doctor_queue_response = asyncio.run(_request("GET", "/api/v1/workflow/doctor-review-queue", token=token))
    assert doctor_queue_response.status_code == 200
    assert doctor_queue_response.json()["page"]["total"] >= 1


def test_report_upload_and_processing_jobs_flow() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    list_response = asyncio.run(_request("GET", "/api/v1/reports", token=token, params={"q": "rpt_001"}))
    assert list_response.status_code == 200
    assert list_response.json()["page"]["total"] >= 1

    upload_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/reports/uploads",
            token=token,
            json={
                "patient_id": "pat_010",
                "visit_id": "vis_010",
                "file_name": "ultrasound-note.pdf",
                "file_type": "pdf",
            },
        )
    )
    assert upload_response.status_code == 201
    upload_payload = upload_response.json()
    report_id = upload_payload["report"]["id"]
    assert upload_payload["upload_url"].startswith("https://storage.example.local/upload/")

    jobs_response = asyncio.run(_request("GET", "/api/v1/reports/processing-jobs", token=token))
    assert jobs_response.status_code == 200
    assert jobs_response.json()["page"]["total"] >= 1

    extract_response = asyncio.run(
        _request(
            "POST",
            f"/api/v1/reports/{report_id}/extract-text",
            token=token,
            json={"engine": "placeholder"},
        )
    )
    assert extract_response.status_code == 200
    assert "Placeholder extraction" in extract_response.json()["extracted_text"]
