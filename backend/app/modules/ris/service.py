from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.ris.schemas import (
    AssignRadiologistRequest,
    CreateImagingOrderRequest,
    ImagingOrderItem,
    UpdateImagingOrderStatusRequest,
)

T = TypeVar("T")

_ORDERS: list[ImagingOrderItem] = [
    ImagingOrderItem(
        id="img_001",
        patient_id="pat_001",
        visit_id="vis_001",
        modality="xray",
        body_part="chest",
        clinical_indication="Persistent cough",
        status="scheduled",
        radiologist_id=None,
        created_at="2026-05-23T08:40:00Z",
    ),
    ImagingOrderItem(
        id="img_002",
        patient_id="pat_003",
        visit_id="vis_003",
        modality="ultrasound",
        body_part="abdomen",
        clinical_indication="Pain follow-up",
        status="acquired",
        radiologist_id="rad_002",
        created_at="2026-05-23T09:00:00Z",
    ),
]

_next_order_id = 3
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


def list_imaging_orders(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
    modalities: Sequence[str] = (),
) -> tuple[list[ImagingOrderItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_modalities = _normalize_tokens(modalities)

    filtered = [
        item
        for item in _ORDERS
        if (
            _matches_exact_token(normalized_statuses, item.status)
            and _matches_exact_token(normalized_modalities, item.modality)
            and _matches_query(
                search,
                item.id,
                item.patient_id,
                item.visit_id,
                item.modality,
                item.body_part,
                item.clinical_indication,
                item.status,
                item.radiologist_id or "",
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_imaging_order(payload: CreateImagingOrderRequest) -> ImagingOrderItem:
    global _next_order_id

    with _lock:
        item = ImagingOrderItem(
            id=f"img_{_next_order_id:03d}",
            patient_id=payload.patient_id,
            visit_id=payload.visit_id,
            modality=payload.modality.strip().lower(),
            body_part=payload.body_part.strip().lower(),
            clinical_indication=payload.clinical_indication.strip(),
            status="scheduled",
            radiologist_id=None,
            created_at="2026-05-23T12:00:00Z",
        )
        _ORDERS.append(item)
        _next_order_id += 1

    return item


def assign_radiologist(order_id: str, payload: AssignRadiologistRequest) -> ImagingOrderItem | None:
    with _lock:
        for index, item in enumerate(_ORDERS):
            if item.id != order_id:
                continue
            updated = item.model_copy(
                update={
                    "radiologist_id": payload.radiologist_id,
                    "status": "assigned",
                }
            )
            _ORDERS[index] = updated
            return updated
    return None


def update_order_status(order_id: str, payload: UpdateImagingOrderStatusRequest) -> ImagingOrderItem | None:
    with _lock:
        for index, item in enumerate(_ORDERS):
            if item.id != order_id:
                continue
            updated = item.model_copy(
                update={"status": payload.status.strip().lower().replace(" ", "_")}
            )
            _ORDERS[index] = updated
            return updated
    return None
