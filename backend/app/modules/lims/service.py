from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.lims.schemas import CreateSampleRequest, SampleItem, UpdateSampleStatusRequest

T = TypeVar("T")

_SAMPLES: list[SampleItem] = [
    SampleItem(
        id="smp_001",
        accession_number="ACC-2026-0001",
        patient_id="pat_001",
        visit_id="vis_001",
        sample_type="blood",
        status="collected",
        collected_at="2026-05-23T09:00:00Z",
        verified_by=None,
    ),
    SampleItem(
        id="smp_002",
        accession_number="ACC-2026-0002",
        patient_id="pat_002",
        visit_id="vis_002",
        sample_type="urine",
        status="verification_pending",
        collected_at="2026-05-23T09:15:00Z",
        verified_by=None,
    ),
]

_next_sample_id = 3
_next_accession = 3
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


def _matches_exact_token(filters: tuple[str, ...], value: str) -> bool:
    if not filters:
        return True
    return value.lower() in filters


def _matches_query(query: str | None, *values: str) -> bool:
    if not query:
        return True
    token = query.lower()
    return any(token in value.lower() for value in values)


def _apply_pagination(items: Sequence[T], pagination: PaginationParams) -> list[T]:
    start = pagination.offset
    end = start + pagination.limit
    return list(items[start:end])


def list_samples(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[SampleItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        item
        for item in _SAMPLES
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_query(
                search,
                item.id,
                item.accession_number,
                item.patient_id,
                item.visit_id,
                item.sample_type,
                item.status,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_sample(payload: CreateSampleRequest) -> SampleItem:
    global _next_sample_id, _next_accession

    with _lock:
        sample = SampleItem(
            id=f"smp_{_next_sample_id:03d}",
            accession_number=f"ACC-2026-{_next_accession:04d}",
            patient_id=payload.patient_id,
            visit_id=payload.visit_id,
            sample_type=payload.sample_type.strip().lower(),
            status="collected",
            collected_at="2026-05-23T12:00:00Z",
            verified_by=None,
        )
        _SAMPLES.append(sample)
        _next_sample_id += 1
        _next_accession += 1

    return sample


def update_sample_status(sample_id: str, payload: UpdateSampleStatusRequest) -> SampleItem | None:
    with _lock:
        for index, item in enumerate(_SAMPLES):
            if item.id != sample_id:
                continue
            updated = item.model_copy(
                update={
                    "status": payload.status.strip().lower().replace(" ", "_"),
                    "verified_by": payload.verified_by,
                }
            )
            _SAMPLES[index] = updated
            return updated
    return None
