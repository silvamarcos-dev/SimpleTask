from datetime import date, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.task import TaskStatus, UrgencyLevel
from app.models.task_occurrence import TaskOccurrenceStatus
from app.models.user import User
from app.schemas.task import TaskCreate, TaskResponse, TaskUpdate
from app.services.task_service import TaskService


router = APIRouter(
    prefix="/tasks",
    tags=["Tarefas"],
)


DbSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


# =========================================================
# CRIAÇÃO
# =========================================================

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


# =========================================================
# LISTAGEM
# =========================================================

@router.get(
    "",
    response_model=list[TaskResponse],
)
def list_tasks(
    db: DbSession,
    current_user: CurrentUser,
    scheduled_date: Annotated[
        date | None,
        Query(),
    ] = None,
    urgency: Annotated[
        UrgencyLevel | None,
        Query(),
    ] = None,
    task_status: Annotated[
        TaskStatus | None,
        Query(),
    ] = None,
) -> list[TaskResponse]:

    # =====================================================
    # BUSCA POR UMA DATA ESPECÍFICA
    # =====================================================

    if scheduled_date is not None:

        occurrences = TaskService.list_with_recurrence(
            db=db,
            user=current_user,
            start_date=scheduled_date,
            end_date=scheduled_date,
        )

        result = []

        for task, occurrence_date, occurrence in occurrences:

            if urgency is not None:
                if task.urgency != urgency:
                    continue

            if task_status is not None:
                if occurrence.status.value != task_status.value:
                    continue

            task_data = {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "urgency": task.urgency,

                # O status pertence à ocorrência.
                "status": TaskStatus(
                    occurrence.status.value
                ),

                "scheduled_date": occurrence_date,
                "scheduled_time": task.scheduled_time,

                "building": task.building,
                "block": task.block,
                "apartment": task.apartment,

                "is_recurring": task.is_recurring,
                "recurrence_type": task.recurrence_type,
                "recurrence_interval": task.recurrence_interval,
                "next_recurrence_date": task.next_recurrence_date,

                "completed_at": occurrence.completed_at,

                "user_id": task.user_id,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
            }

            result.append(task_data)

        return result

    # =====================================================
    # LISTAGEM GERAL
    # =====================================================

    today = date.today()

    start_date = today - timedelta(days=365)
    end_date = today + timedelta(days=365)

    occurrences = TaskService.list_with_recurrence(
        db=db,
        user=current_user,
        start_date=start_date,
        end_date=end_date,
    )

    result = []

    for task, occurrence_date, occurrence in occurrences:

        if urgency is not None:
            if task.urgency != urgency:
                continue

        if task_status is not None:
            if occurrence.status.value != task_status.value:
                continue

        task_data = {
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "urgency": task.urgency,

            # O status pertence à ocorrência.
            "status": TaskStatus(
                occurrence.status.value
            ),

            "scheduled_date": occurrence_date,
            "scheduled_time": task.scheduled_time,

            "building": task.building,
            "block": task.block,
            "apartment": task.apartment,

            "is_recurring": task.is_recurring,
            "recurrence_type": task.recurrence_type,
            "recurrence_interval": task.recurrence_interval,
            "next_recurrence_date": task.next_recurrence_date,

            "completed_at": occurrence.completed_at,

            "user_id": task.user_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
        }

        result.append(task_data)

    return result


# =========================================================
# CONCLUIR OCORRÊNCIA
# =========================================================

@router.patch(
    "/{task_id}/occurrence/{occurrence_date}/complete",
)
def complete_task_occurrence(
    task_id: int,
    occurrence_date: date,
    db: DbSession,
    current_user: CurrentUser,
):
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

    occurrence_dates = TaskService.generate_recurrence_dates(
        task=task,
        start_date=occurrence_date,
        end_date=occurrence_date,
    )

    if occurrence_date not in occurrence_dates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ocorrência não encontrada para esta tarefa.",
        )

    occurrence = TaskService.complete_occurrence(
        db=db,
        task=task,
        occurrence_date=occurrence_date,
    )

    return {
        "id": occurrence.id,
        "task_id": occurrence.task_id,
        "occurrence_date": occurrence.occurrence_date,
        "status": occurrence.status.value,
        "completed_at": occurrence.completed_at,
    }


# =========================================================
# REABRIR OCORRÊNCIA
# =========================================================

@router.patch(
    "/{task_id}/occurrence/{occurrence_date}/reopen",
)
def reopen_task_occurrence(
    task_id: int,
    occurrence_date: date,
    db: DbSession,
    current_user: CurrentUser,
):
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

    occurrence_dates = TaskService.generate_recurrence_dates(
        task=task,
        start_date=occurrence_date,
        end_date=occurrence_date,
    )

    if occurrence_date not in occurrence_dates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ocorrência não encontrada para esta tarefa.",
        )

    occurrence = TaskService.reopen_occurrence(
        db=db,
        task=task,
        occurrence_date=occurrence_date,
    )

    return {
        "id": occurrence.id,
        "task_id": occurrence.task_id,
        "occurrence_date": occurrence.occurrence_date,
        "status": occurrence.status.value,
        "completed_at": occurrence.completed_at,
    }


# =========================================================
# BUSCAR POR ID
# =========================================================

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


# =========================================================
# ATUALIZAÇÃO
# =========================================================

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


# =========================================================
# EXCLUSÃO
# =========================================================

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