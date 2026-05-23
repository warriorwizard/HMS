from __future__ import annotations

from collections.abc import Sequence
from threading import Lock
from typing import TypeVar

from app.api.pagination import PaginationParams
from app.modules.reports.schemas import (
    ExtractTextRequest,
    ExtractTextResponse,
    ProcessingJobItem,
    ReportItem,
    UploadReportRequest,
    UploadReportResponse,
)

T = TypeVar("T")


class StorageAdapter:
    def build_upload_url(self, storage_key: str) -> str:
        return f"https://storage.example.local/upload/{storage_key}?signature=mock-signature"


_STORAGE = StorageAdapter()

_REPORTS: list[ReportItem] = [
    ReportItem(
        id="rpt_001",
        patient_id="pat_001",
        visit_id="vis_001",
        file_name="chest-xray-asha.pdf",
        file_type="pdf",
        status="uploaded",
        storage_key="tenant-a/reports/rpt_001/chest-xray-asha.pdf",
        uploaded_by="tech_001",
        uploaded_at="2026-05-23T09:00:00Z",
    ),
    ReportItem(
        id="rpt_002",
        patient_id="pat_002",
        visit_id="vis_002",
        file_name="cbc-kiran.csv",
        file_type="csv",
        status="processing",
        storage_key="tenant-a/reports/rpt_002/cbc-kiran.csv",
        uploaded_by="tech_002",
        uploaded_at="2026-05-23T09:10:00Z",
    ),
]

_JOBS: list[ProcessingJobItem] = [
    ProcessingJobItem(
        id="job_001",
        report_id="rpt_001",
        status="completed",
        stage="text_extraction",
        started_at="2026-05-23T09:01:00Z",
        updated_at="2026-05-23T09:02:00Z",
        extraction_preview="No acute cardiopulmonary abnormality.",
    ),
    ProcessingJobItem(
        id="job_002",
        report_id="rpt_002",
        status="running",
        stage="normalization",
        started_at="2026-05-23T09:11:00Z",
        updated_at="2026-05-23T09:14:00Z",
        extraction_preview="Preparing lab panel data for structured parsing.",
    ),
]

_next_report_id = 3
_next_job_id = 3
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


def list_reports(
    *,
    pagination: PaginationParams,
    search: str | None = None,
    statuses: Sequence[str] = (),
    file_types: Sequence[str] = (),
) -> tuple[list[ReportItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_types = _normalize_tokens(file_types)
    filtered = [
        report
        for report in _REPORTS
        if (
            _matches_exact_token(normalized_statuses, report.status)
            and _matches_exact_token(normalized_types, report.file_type)
            and _matches_query(
                search,
                report.id,
                report.patient_id,
                report.visit_id,
                report.file_name,
                report.file_type,
                report.status,
            )
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def create_upload(payload: UploadReportRequest) -> UploadReportResponse:
    global _next_report_id, _next_job_id

    with _lock:
        report_id = f"rpt_{_next_report_id:03d}"
        job_id = f"job_{_next_job_id:03d}"
        storage_key = f"tenant-a/reports/{report_id}/{payload.file_name.strip()}"

        report = ReportItem(
            id=report_id,
            patient_id=payload.patient_id,
            visit_id=payload.visit_id,
            file_name=payload.file_name.strip(),
            file_type=payload.file_type.strip().lower(),
            status="uploaded",
            storage_key=storage_key,
            uploaded_by="tech_uploader",
            uploaded_at="2026-05-23T12:00:00Z",
        )

        _REPORTS.append(report)
        _JOBS.append(
            ProcessingJobItem(
                id=job_id,
                report_id=report_id,
                status="queued",
                stage="text_extraction",
                started_at="2026-05-23T12:00:00Z",
                updated_at="2026-05-23T12:00:00Z",
                extraction_preview="Extraction will be available once processing starts.",
            )
        )

        _next_report_id += 1
        _next_job_id += 1

    return UploadReportResponse(report=report, upload_url=_STORAGE.build_upload_url(storage_key))


def list_processing_jobs(
    *,
    pagination: PaginationParams,
    statuses: Sequence[str] = (),
    stages: Sequence[str] = (),
) -> tuple[list[ProcessingJobItem], int]:
    normalized_statuses = _normalize_tokens(statuses)
    normalized_stages = _normalize_tokens(stages)
    filtered = [
        job
        for job in _JOBS
        if (
            _matches_exact_token(normalized_statuses, job.status)
            and _matches_exact_token(normalized_stages, job.stage)
        )
    ]
    total = len(filtered)
    return _apply_pagination(filtered, pagination), total


def extract_text(report_id: str, payload: ExtractTextRequest) -> ExtractTextResponse | None:
    report = next((item for item in _REPORTS if item.id == report_id), None)
    if report is None:
        return None

    return ExtractTextResponse(
        report_id=report_id,
        engine=payload.engine,
        extracted_text=(
            "Placeholder extraction: parsed report metadata and first-pass finding summary "
            f"for file {report.file_name}."
        ),
    )
