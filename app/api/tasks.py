from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.task import TaskStatus, UrgencyLevel
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import TaskService


router = APIRouter(
    prefix="/tasks",
    tags=["Tarefas"],
)


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_task(
    task_data: TaskCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> TaskResponse:
    return TaskService.create(
        db,
        current_user,
        task_data,
    )


@router.get(
    "",
    response_model=list[TaskResponse],
)
def list_tasks(
    db: DbSession,
    current_user: CurrentUser,
    scheduled_date: Annotated[date | None, Query()] = None,
    urgency: Annotated[UrgencyLevel | None, Query()] = None,
    task_status: Annotated[TaskStatus | None, Query()] = None,
) -> list[TaskResponse]:
    return TaskService.list(
        db,
        current_user,
        scheduled_date=scheduled_date,
        urgency=urgency,
        status=task_status,
    )


@router.get(
    "/{task_id}",
    response_model=TaskResponse,
)
def get_task(
    task_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> TaskResponse:
    task = TaskService.get_by_id(
        db,
        current_user,
        task_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )

    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> TaskResponse:
    task = TaskService.get_by_id(
        db,
        current_user,
        task_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )

    return TaskService.update(
        db,
        task,
        task_data,
    )


@router.delete(
    "/{task_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_task(
    task_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    task = TaskService.get_by_id(
        db,
        current_user,
        task_id,
    )

    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )

    TaskService.delete(
        db,
        task,
    )