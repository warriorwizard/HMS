from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.filtering import normalize_search_query, parse_csv_values
from app.api.pagination import PaginationBoundsError, build_paginated_response, validate_pagination
from app.modules.diagnostic_workflow.schemas import (
    TransitionTaskRequest,
    WorkflowQueueResponse,
    WorkflowTaskItem,
    WorkflowTasksResponse,
)
from app.modules.diagnostic_workflow.service import (
    list_doctor_review_queue,
    list_technician_queue,
    list_workflow_tasks,
    transition_task,
)
from app.modules.identity.dependencies import get_current_identity
from app.modules.identity.service import AuthenticatedIdentity

router = APIRouter(prefix="/workflow", tags=["workflow"])


@router.get("/tasks", response_model=WorkflowTasksResponse)
def get_workflow_tasks(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    q: str | None = Query(default=None),
    stage_filters: str | list[str] | None = Query(default=None, alias="stage"),
    status_filters: str | list[str] | None = Query(default=None, alias="status"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> WorkflowTasksResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_workflow_tasks(
        pagination=pagination,
        search=normalize_search_query(q),
        stages=parse_csv_values(stage_filters),
        statuses=parse_csv_values(status_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return WorkflowTasksResponse.model_validate(payload)


@router.get("/technician-queue", response_model=WorkflowQueueResponse)
def get_technician_queue(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    priority_filters: str | list[str] | None = Query(default=None, alias="priority"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> WorkflowQueueResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_technician_queue(
        pagination=pagination,
        priorities=parse_csv_values(priority_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return WorkflowQueueResponse.model_validate(payload)


@router.get("/doctor-review-queue", response_model=WorkflowQueueResponse)
def get_doctor_review_queue(
    limit: int = Query(default=25),
    offset: int = Query(default=0),
    priority_filters: str | list[str] | None = Query(default=None, alias="priority"),
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> WorkflowQueueResponse:
    try:
        pagination = validate_pagination(limit=limit, offset=offset)
    except PaginationBoundsError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc

    items, total = list_doctor_review_queue(
        pagination=pagination,
        priorities=parse_csv_values(priority_filters),
    )
    payload = build_paginated_response(
        [item.model_dump() for item in items],
        pagination=pagination,
        total=total,
    )
    return WorkflowQueueResponse.model_validate(payload)


@router.post("/tasks/{task_id}/transition", response_model=WorkflowTaskItem)
def post_task_transition(
    task_id: str,
    payload: TransitionTaskRequest,
    _: AuthenticatedIdentity = Depends(get_current_identity),
) -> WorkflowTaskItem:
    task = transition_task(task_id, payload)
    if task is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task
