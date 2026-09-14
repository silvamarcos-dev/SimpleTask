from datetime import date, datetime, timedelta, timezone

from dateutil.relativedelta import relativedelta
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import (
    RecurrenceType,
    Task,
    TaskStatus,
    UrgencyLevel,
)
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:

    # =====================================================
    # RECORRÊNCIA
    # =====================================================

    @staticmethod
    def _calculate_next_recurrence_date(
        task: Task,
    ) -> date | None:
        """
        Calcula a próxima ocorrência de uma tarefa recorrente.

        Diária  -> +X dias
        Semanal -> +X semanas
        Mensal  -> +X meses
        """

        if not task.is_recurring:
            return None

        if task.recurrence_interval is None:
            return None

        base_date = date.today()

        if task.recurrence_type == RecurrenceType.DAILY:
            return base_date + timedelta(
                days=task.recurrence_interval
            )

        if task.recurrence_type == RecurrenceType.WEEKLY:
            return base_date + timedelta(
                weeks=task.recurrence_interval
            )

        if task.recurrence_type == RecurrenceType.MONTHLY:
            return base_date + relativedelta(
                months=task.recurrence_interval
            )

        return None

    # =====================================================
    # CRIAÇÃO
    # =====================================================

    @staticmethod
    def create(
        db: Session,
        user: User,
        task_data: TaskCreate,
    ) -> Task:

        task = Task(
            title=task_data.title.strip(),
            description=task_data.description,
            urgency=task_data.urgency,
            scheduled_date=task_data.scheduled_date,
            scheduled_time=task_data.scheduled_time,

            building=(
                task_data.building.strip()
                if task_data.building
                else None
            ),

            block=(
                task_data.block.strip()
                if task_data.block
                else None
            ),

            apartment=(
                task_data.apartment.strip()
                if task_data.apartment
                else None
            ),

            is_recurring=task_data.is_recurring,
            recurrence_type=task_data.recurrence_type,
            recurrence_interval=task_data.recurrence_interval,

            status=TaskStatus.PENDING,
            user_id=user.id,
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    # =====================================================
    # BUSCAR POR ID
    # =====================================================

    @staticmethod
    def get_by_id(
        db: Session,
        user: User,
        task_id: int,
    ) -> Task | None:

        statement = select(Task).where(
            Task.id == task_id,
            Task.user_id == user.id,
        )

        return db.scalar(statement)

    # =====================================================
    # LISTAGEM
    # =====================================================

    @staticmethod
    def list(
        db: Session,
        user: User,
        scheduled_date: date | None = None,
        urgency: UrgencyLevel | None = None,
        status: TaskStatus | None = None,
    ) -> list[Task]:

        statement = select(Task).where(
            Task.user_id == user.id,
        )

        if scheduled_date is not None:
            statement = statement.where(
                Task.scheduled_date == scheduled_date,
            )

        if urgency is not None:
            statement = statement.where(
                Task.urgency == urgency,
            )

        if status is not None:
            statement = statement.where(
                Task.status == status,
            )

        statement = statement.order_by(
            Task.scheduled_date.asc(),
            Task.scheduled_time.asc(),
            Task.created_at.asc(),
        )

        return list(
            db.scalars(statement).all()
        )

    # =====================================================
    # ATUALIZAÇÃO
    # =====================================================

    @staticmethod
    def update(
        db: Session,
        task: Task,
        task_data: TaskUpdate,
    ) -> Task:

        update_data = task_data.model_dump(
            exclude_unset=True,
        )

        previous_status = task.status

        for field, value in update_data.items():
            setattr(
                task,
                field,
                value,
            )

        # =================================================
        # CONCLUSÃO
        # =================================================

        if task.status == TaskStatus.COMPLETED:

            if previous_status != TaskStatus.COMPLETED:
                task.completed_at = (
                    datetime.now(timezone.utc)
                )

            # =============================================
            # RECORRÊNCIA
            # =============================================

            task.next_recurrence_date = (
                TaskService._calculate_next_recurrence_date(
                    task
                )
            )

        # =================================================
        # TAREFA VOLTOU PARA PENDENTE / EM ANDAMENTO
        # =================================================

        else:

            task.completed_at = None

            if previous_status == TaskStatus.COMPLETED:
                task.next_recurrence_date = None

        db.commit()
        db.refresh(task)

        return task

    # =====================================================
    # EXCLUSÃO
    # =====================================================

    @staticmethod
    def delete(
        db: Session,
        task: Task,
    ) -> None:

        db.delete(task)
        db.commit()