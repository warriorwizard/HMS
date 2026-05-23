from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.pacs.schemas import (
    DicomImageItem,
    DicomSeriesItem,
    DicomStudiesResponse,
    DicomStudyItem,
    DicomUploadRequest,
    DicomUploadResponse,
    SignedDicomAccessResponse,
)

T = TypeVar("T")


class DicomStorageAdapter:
    def upload_url(self, file_id: str) -> str:
        return f"https://dicom-storage.example.local/upload/{file_id}?signature=mock"

    def access_url(self, file_id: str) -> str:
        return f"https://dicom-storage.example.local/access/{file_id}?signature=mock"


_STORAGE = DicomStorageAdapter()

_STUDIES: list[DicomStudyItem] = [
    DicomStudyItem(
        id="std_001",
        patient_id="pat_001",
        order_id="img_001",
        study_uid="1.2.840.10008.1.2.1.1001",
        status="available",
        series=[
            DicomSeriesItem(
                id="ser_001",
                series_uid="1.2.840.10008.1.2.1.1001.1",
                modality="xray",
                images=[
                    DicomImageItem(
                        id="imgfile_001",
                        instance_number=1,
                        sop_instance_uid="1.2.840.10008.1.2.1.1001.1.1",
                    )
                ],
            )
        ],
    )
]

_file_to_study: dict[str, str] = {"imgfile_001": "std_001"}
_next_study_id = 2
_next_file_id = 2
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


def list_studies(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
) -> tuple[list[DicomStudyItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    filtered = [
        study
        for study in _STUDIES
        if (
            _matches_exact_token(normalized_statuses, study.status)
            and _matches_query(
                search,
                study.id,
                study.patient_id,
                study.order_id,
                study.study_uid,
                study.status,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def get_study(study_id: str) -> DicomStudyItem | None:
    return next((item for item in _STUDIES if item.id == study_id), None)


def create_dicom_upload(payload: DicomUploadRequest) -> DicomUploadResponse:
    global _next_study_id, _next_file_id

    with _lock:
        study = next((item for item in _STUDIES if item.study_uid == payload.study_uid), None)
        if study is None:
            study = DicomStudyItem(
                id=f"std_{_next_study_id:03d}",
                patient_id=payload.patient_id,
                order_id=payload.order_id,
                study_uid=payload.study_uid,
                status="uploading",
                series=[],
            )
            _STUDIES.append(study)
            _next_study_id += 1

        file_id = f"imgfile_{_next_file_id:03d}"
        _next_file_id += 1

        if study.series:
            series = study.series[0]
            series.images.append(
                DicomImageItem(
                    id=file_id,
                    instance_number=len(series.images) + 1,
                    sop_instance_uid=f"{study.study_uid}.{len(series.images) + 1}",
                )
            )
        else:
            study.series.append(
                DicomSeriesItem(
                    id=f"ser_{study.id.split('_')[-1]}",
                    series_uid=f"{study.study_uid}.1",
                    modality="unknown",
                    images=[
                        DicomImageItem(
                            id=file_id,
                            instance_number=1,
                            sop_instance_uid=f"{study.study_uid}.1.1",
                        )
                    ],
                )
            )

        _file_to_study[file_id] = study.id

    return DicomUploadResponse(file_id=file_id, study_id=study.id, upload_url=_STORAGE.upload_url(file_id))


def get_signed_access(file_id: str) -> SignedDicomAccessResponse | None:
    if file_id not in _file_to_study:
        return None
    return SignedDicomAccessResponse(
        file_id=file_id,
        access_url=_STORAGE.access_url(file_id),
        expires_at="2026-05-23T13:00:00Z",
    )
