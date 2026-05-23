from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity
from app.modules.reports.schemas import (
    ExtractTextRequest,
    ExtractTextResponse,
    ProcessingJobsResponse,
    ReportsResponse,
    UploadReportRequest,
    UploadReportResponse,
)
from app.modules.reports.service import create_upload, extract_text, list_processing_jobs, list_reports

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=ReportsResponse)
def get_reports(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    file_type_filters: str | list[str] | None = Query(default=None, alias="file_type"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ReportsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_reports(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
        file_types=parse_csv_values(file_type_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return ReportsResponse.model_validate(payload)


@router.post("/uploads", response_model=UploadReportResponse, status_code=status.HTTP_201_CREATED)
def post_report_upload(
    payload: UploadReportRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> UploadReportResponse:
    return create_upload(payload)


@router.get("/processing-jobs", response_model=ProcessingJobsResponse)
def get_processing_jobs(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    stage_filters: str | list[str] | None = Query(default=None, alias="stage"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ProcessingJobsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_processing_jobs(
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
        stages=parse_csv_values(stage_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return ProcessingJobsResponse.model_validate(payload)


@router.post("/{report_id}/extract-text", response_model=ExtractTextResponse)
def post_extract_text(
    report_id: str,
    payload: ExtractTextRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> ExtractTextResponse:
    result = extract_text(report_id, payload)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return result
