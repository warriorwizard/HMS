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


def test_ai_intelligence_endpoints() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    results_response = asyncio.run(_request("GET", "/api/v1/ai/results", token=token))
    assert results_response.status_code == 200
    report_id = results_response.json()["items"][0]["report_id"]

    task_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/ai/tasks",
            token=token,
            json={"report_id": report_id, "patient_id": "pat_001", "task_type": "summarization"},
        )
    )
    assert task_response.status_code == 200
    assert task_response.json()["status"] == "queued"

    risk_response = asyncio.run(_request("GET", f"/api/v1/ai/reports/{report_id}/risk-score", token=token))
    assert risk_response.status_code == 200
    assert risk_response.json()["risk_level"] in {"critical", "high", "moderate", "low"}


def test_command_center_review_and_approval_flow() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    queue_response = asyncio.run(_request("GET", "/api/v1/command-center/queue", token=token))
    assert queue_response.status_code == 200
    queue_id = queue_response.json()["items"][0]["id"]

    review_response = asyncio.run(
        _request(
            "POST",
            f"/api/v1/command-center/reviews/{queue_id}/action",
            token=token,
            json={"action": "reviewed", "note": "Reviewed and routing complete"},
        )
    )
    assert review_response.status_code == 200
    assert review_response.json()["status"] == "reviewed"

    approval_response = asyncio.run(
        _request(
            "POST",
            f"/api/v1/command-center/recommendations/{queue_id}/approval",
            token=token,
            json={"approved": True, "note": "Approved recommendation"},
        )
    )
    assert approval_response.status_code == 200
    assert approval_response.json()["status"] == "approved"


def test_copilot_conversation_context_and_note_generation() -> None:
    _install_test_db()
    token = _login_and_get_access_token()

    conversations_response = asyncio.run(_request("GET", "/api/v1/copilot/conversations", token=token))
    assert conversations_response.status_code == 200
    conversation_id = conversations_response.json()["items"][0]["id"]
    patient_id = conversations_response.json()["items"][0]["patient_id"]

    message_response = asyncio.run(
        _request(
            "POST",
            f"/api/v1/copilot/conversations/{conversation_id}/messages",
            token=token,
            json={"role": "doctor", "content": "Draft a concise plan."},
        )
    )
    assert message_response.status_code == 201

    context_response = asyncio.run(
        _request(
            "GET",
            "/api/v1/copilot/context",
            token=token,
            params={"patient_id": patient_id},
        )
    )
    assert context_response.status_code == 200

    note_response = asyncio.run(
        _request(
            "POST",
            "/api/v1/copilot/note-draft",
            token=token,
            json={"patient_id": patient_id, "tone": "clinical"},
        )
    )
    assert note_response.status_code == 200
    assert "Patient" in note_response.json()["note_draft"]
