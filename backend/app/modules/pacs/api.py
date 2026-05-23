from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity
from app.modules.pacs.schemas import (
    DicomStudiesResponse,
    DicomStudyItem,
    DicomUploadRequest,
    DicomUploadResponse,
    SignedDicomAccessResponse,
)
from app.modules.pacs.service import create_dicom_upload, get_signed_access, get_study, list_studies

router = APIRouter(prefix="/pacs", tags=["pacs"])


@router.get("/studies", response_model=DicomStudiesResponse)
def get_studies(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> DicomStudiesResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_studies(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return DicomStudiesResponse.model_validate(payload)


@router.get("/studies/{study_id}", response_model=DicomStudyItem)
def get_study_by_id(
    study_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> DicomStudyItem:
    study = get_study(study_id)
    if study is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study not found")
    return study


@router.post("/uploads", response_model=DicomUploadResponse, status_code=status.HTTP_201_CREATED)
def post_dicom_upload(
    payload: DicomUploadRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> DicomUploadResponse:
    return create_dicom_upload(payload)


@router.get("/files/{file_id}/signed-url", response_model=SignedDicomAccessResponse)
def get_dicom_signed_url(
    file_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> SignedDicomAccessResponse:
    access = get_signed_access(file_id)
    if access is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DICOM file not found")
    return access
