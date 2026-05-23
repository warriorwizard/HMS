from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity
from app.modules.patients.schemas import (
    CreatePatientRequest,
    CreateVisitRequest,
    PatientItem,
    PatientsResponse,
    TimelineResponse,
    UpdatePatientRequest,
    VisitItem,
    VisitsResponse,
)
from app.modules.patients.service import (
    create_patient,
    create_visit,
    get_patient,
    list_patients,
    list_timeline,
    list_visits,
    update_patient,
)

router = APIRouter(prefix="/patients", tags=["patients"])


@router.get("", response_model=PatientsResponse)
def get_patients(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PatientsResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_patients(
        pagination=pagination,
        search=normalize_search_query(q),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return PatientsResponse.model_validate(payload)


@router.post("", response_model=PatientItem, status_code=status.HTTP_201_CREATED)
def post_patient(
    payload: CreatePatientRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PatientItem:
    return create_patient(payload)


@router.get("/{patient_id}", response_model=PatientItem)
def get_patient_by_id(
    patient_id: str,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PatientItem:
    patient = get_patient(patient_id)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.patch("/{patient_id}", response_model=PatientItem)
def patch_patient(
    patient_id: str,
    payload: UpdatePatientRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> PatientItem:
    patient = update_patient(patient_id, payload)
    if patient is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return patient


@router.get("/{patient_id}/visits", response_model=VisitsResponse)
def get_patient_visits(
    patient_id: str,
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> VisitsResponse:
    if get_patient(patient_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_visits(
        patient_id=patient_id,
        pagination=pagination,
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return VisitsResponse.model_validate(payload)


@router.post("/{patient_id}/visits", response_model=VisitItem, status_code=status.HTTP_201_CREATED)
def post_visit(
    patient_id: str,
    payload: CreateVisitRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> VisitItem:
    visit = create_visit(patient_id, payload)
    if visit is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")
    return visit


@router.get("/{patient_id}/timeline", response_model=TimelineResponse)
def get_patient_timeline(
    patient_id: str,
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    event_type_filters: str | list[str] | None = Query(default=None, alias="event_type"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> TimelineResponse:
    if get_patient(patient_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Patient not found")

    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_timeline(
        patient_id=patient_id,
        pagination=pagination,
        event_types=parse_csv_values(event_type_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return TimelineResponse.model_validate(payload)
