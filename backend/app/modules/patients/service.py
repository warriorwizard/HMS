from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.patients.schemas import (
    CreatePatientRequest,
    CreateVisitRequest,
    PatientItem,
    TimelineEventItem,
    UpdatePatientRequest,
    VisitItem,
)

T = TypeVar("T")

_PATIENTS: list[PatientItem] = [
    PatientItem(
        id="pat_001",
        registration_id="REG-2026-1001",
        full_name="Asha Rao",
        age=54,
        sex="F",
        primary_condition="Pulmonary review",
        status="active",
        created_at="2026-05-23T07:10:00Z",
    ),
    PatientItem(
        id="pat_002",
        registration_id="REG-2026-1002",
        full_name="Kiran Mehta",
        age=61,
        sex="M",
        primary_condition="Inflammation trend",
        status="active",
        created_at="2026-05-23T07:30:00Z",
    ),
    PatientItem(
        id="pat_003",
        registration_id="REG-2026-1003",
        full_name="Nisha Patel",
        age=38,
        sex="F",
        primary_condition="Abdominal imaging",
        status="pending_follow_up",
        created_at="2026-05-23T08:10:00Z",
    ),
]

_VISITS: list[VisitItem] = [
    VisitItem(
        id="vis_001",
        patient_id="pat_001",
        visit_type="radiology_review",
        status="ready_for_doctor",
        scheduled_at="2026-05-23T09:30:00Z",
        created_at="2026-05-23T07:45:00Z",
    ),
    VisitItem(
        id="vis_002",
        patient_id="pat_002",
        visit_type="lab_follow_up",
        status="sample_collection",
        scheduled_at="2026-05-23T10:15:00Z",
        created_at="2026-05-23T08:00:00Z",
    ),
    VisitItem(
        id="vis_003",
        patient_id="pat_003",
        visit_type="ultrasound_review",
        status="uploaded",
        scheduled_at="2026-05-23T11:00:00Z",
        created_at="2026-05-23T08:25:00Z",
    ),
]

_TIMELINE: list[TimelineEventItem] = [
    TimelineEventItem(
        id="tln_001",
        patient_id="pat_001",
        event_type="patient_registered",
        description="Patient profile created and demographics validated.",
        created_at="2026-05-23T07:10:00Z",
    ),
    TimelineEventItem(
        id="tln_002",
        patient_id="pat_001",
        event_type="visit_created",
        description="Radiology review visit created and assigned to queue.",
        created_at="2026-05-23T07:45:00Z",
    ),
    TimelineEventItem(
        id="tln_003",
        patient_id="pat_002",
        event_type="patient_registered",
        description="Patient profile linked with prior diagnostics.",
        created_at="2026-05-23T07:30:00Z",
    ),
    TimelineEventItem(
        id="tln_004",
        patient_id="pat_002",
        event_type="visit_created",
        description="Lab follow-up visit added with sample collection stage.",
        created_at="2026-05-23T08:00:00Z",
    ),
]

_next_patient_id = 4
_next_visit_id = 4
_next_timeline_id = 5
_lock = Lock()


def _normalize_tokens(values: Sequence[str]) -> tuple[str, ...]:
    normalized: list[str] = []
    seen: set[str] = set()
    for value in values:
        token = value.strip().lower()
        if not token or token in seen:
            continue
        normalized.append(token)
        seen.add(token)
    return tuple(normalized)


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    token = query.lower()
    return any(token in value.lower() for value in values)


def _matches_exact_token(filters: tuple[str, ...], value: str) -> bool:
    if not filters:
        return True
    return value.lower() in filters


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_patients(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[PatientItem], int]:
    normalized_statuses = _normalize_tokens(statuses)

    filtered = [
        patient
        for patient in _PATIENTS
        if (
            _matches_exact_token(normalized_statuses, patient.status)
            and _matches_query(
                search,
                patient.id,
                patient.registration_id,
                patient.full_name,
                patient.primary_condition,
                patient.status,
                patient.sex,
                str(patient.age),
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def get_patient(patient_id: str) -> PatientItem | None:
    for patient in _PATIENTS:
        if patient.id == patient_id:
            return patient
    return None


def create_patient(payload: CreatePatientRequest) -> PatientItem:
    global _next_patient_id

    with _lock:
        patient = PatientItem(
            id=f"pat_{_next_patient_id:03d}",
            registration_id=f"REG-2026-{1000 + _next_patient_id}",
            full_name=payload.full_name.strip(),
            age=payload.age,
            sex=payload.sex.strip().upper(),
            primary_condition=payload.primary_condition.strip(),
            status="active",
            created_at="2026-05-23T12:00:00Z",
        )
        _PATIENTS.append(patient)
        _next_patient_id += 1

    _append_timeline_event(
        patient_id=patient.id,
        event_type="patient_registered",
        description="Patient profile created through registration UI.",
    )
    return patient


def update_patient(patient_id: str, payload: UpdatePatientRequest) -> PatientItem | None:
    with _lock:
        for index, patient in enumerate(_PATIENTS):
            if patient.id != patient_id:
                continue

            updated = patient.model_copy(
                update={
                    "full_name": payload.full_name.strip() if payload.full_name else patient.full_name,
                    "age": payload.age if payload.age is not None else patient.age,
                    "sex": payload.sex.strip().upper() if payload.sex else patient.sex,
                    "primary_condition": (
                        payload.primary_condition.strip()
                        if payload.primary_condition
                        else patient.primary_condition
                    ),
                    "status": payload.status.strip().lower() if payload.status else patient.status,
                }
            )
            _PATIENTS[index] = updated
            _append_timeline_event(
                patient_id=patient_id,
                event_type="patient_updated",
                description="Patient profile updated through management API.",
            )
            return updated
    return None


def list_visits(
    *,
    patient_id: str,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
) -> tuple[list[VisitItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        visit
        for visit in _VISITS
        if visit.patient_id == patient_id and _matches_exact_token(normalized_statuses, visit.status)
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_visit(patient_id: str, payload: CreateVisitRequest) -> VisitItem | None:
    global _next_visit_id

    if get_patient(patient_id) is None:
        return None

    with _lock:
        visit = VisitItem(
            id=f"vis_{_next_visit_id:03d}",
            patient_id=patient_id,
            visit_type=payload.visit_type.strip().lower().replace(" ", "_"),
            status=payload.status.strip().lower().replace(" ", "_"),
            scheduled_at=payload.scheduled_at.strip(),
            created_at="2026-05-23T12:00:00Z",
        )
        _VISITS.append(visit)
        _next_visit_id += 1

    _append_timeline_event(
        patient_id=patient_id,
        event_type="visit_created",
        description=f"Visit {visit.id} created with status {visit.status}.",
    )
    return visit


def list_timeline(
    *,
    patient_id: str,
    pagination: PaginationParams,
    event_types: Sequence[str] = (),
) -> tuple[list[TimelineEventItem], int]:
    normalized_types = _normalize_tokens(event_types)
    filtered = [
        event
        for event in _TIMELINE
        if event.patient_id == patient_id and _matches_exact_token(normalized_types, event.event_type)
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def _append_timeline_event(*, patient_id: str, event_type: str, description: str) -> None:
    global _next_timeline_id

    with _lock:
        _TIMELINE.append(
            TimelineEventItem(
                id=f"tln_{_next_timeline_id:03d}",
                patient_id=patient_id,
                event_type=event_type,
                description=description,
                created_at="2026-05-23T12:00:00Z",
            )
        )
        _next_timeline_id += 1
