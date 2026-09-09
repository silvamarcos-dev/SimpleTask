from datetime import date, datetime, timezone

from dateutil.relativedelta import relativedelta
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus, UrgencyLevel
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate


class TaskService:
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

            recurrence_interval_months=(
                task_data.recurrence_interval_months
            ),

            status=TaskStatus.PENDING,
            user_id=user.id,
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        return task

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
            if (
                previous_status
                != TaskStatus.COMPLETED
            ):
                task.completed_at = (
                    datetime.now(timezone.utc)
                )

                # =========================================
                # RECORRÊNCIA
                # =========================================

                if (
                    task.is_recurring
                    and task.recurrence_interval_months
                    is not None
                ):
                    task.next_recurrence_date = (
                        date.today()
                        + relativedelta(
                            months=task.recurrence_interval_months,
                        )
                    )
                else:
                    task.next_recurrence_date = None

        # =================================================
        # TAREFA VOLTOU PARA PENDENTE
        # =================================================

        else:
            task.completed_at = None

            if (
                previous_status
                == TaskStatus.COMPLETED
            ):
                task.next_recurrence_date = None

        db.commit()
        db.refresh(task)

        return task

    @staticmethod
    def delete(
        db: Session,
        task: Task,
    ) -> None:
        db.delete(task)
        db.commit()