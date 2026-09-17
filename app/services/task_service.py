from __future__ import annotations

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
from app.models.task_occurrence import (
    TaskOccurrence,
    TaskOccurrenceStatus,
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
        base_date: date | None = None,
    ) -> date | None:

        if not task.is_recurring:
            return None

        if task.recurrence_interval is None:
            return None

        if base_date is None:
            base_date = task.scheduled_date

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
    # GERAR DATAS DE RECORRÊNCIA
    # =====================================================

    @staticmethod
    def generate_recurrence_dates(
        task: Task,
        start_date: date,
        end_date: date,
    ) -> list[date]:

        if start_date > end_date:
            return []

        # -------------------------------------------------
        # TAREFA NORMAL
        # -------------------------------------------------

        if not task.is_recurring:

            if start_date <= task.scheduled_date <= end_date:
                return [task.scheduled_date]

            return []

        # -------------------------------------------------
        # RECORRÊNCIA INVÁLIDA
        # -------------------------------------------------

        if task.recurrence_interval is None:
            return []

        if task.recurrence_interval <= 0:
            return []

        if task.recurrence_type == RecurrenceType.NONE:
            return []

        # -------------------------------------------------
        # ENCONTRAR PRIMEIRA OCORRÊNCIA DO INTERVALO
        # -------------------------------------------------

        current_date = task.scheduled_date

        # Segurança para evitar loop infinito.
        max_iterations = 10000
        iterations = 0

        while current_date < start_date:

            current_date = TaskService._calculate_next_recurrence_date(
                task=task,
                base_date=current_date,
            )

            if current_date is None:
                return []

            iterations += 1

            if iterations >= max_iterations:
                return []

        # -------------------------------------------------
        # GERAR OCORRÊNCIAS
        # -------------------------------------------------

        dates: list[date] = []

        while current_date <= end_date:

            dates.append(current_date)

            next_date = TaskService._calculate_next_recurrence_date(
                task=task,
                base_date=current_date,
            )

            if next_date is None:
                break

            if next_date <= current_date:
                break

            current_date = next_date

        return dates

    # =====================================================
    # BUSCAR OCORRÊNCIA
    # =====================================================

    @staticmethod
    def get_occurrence(
        db: Session,
        task: Task,
        occurrence_date: date,
    ) -> TaskOccurrence | None:

        statement = select(TaskOccurrence).where(
            TaskOccurrence.task_id == task.id,
            TaskOccurrence.occurrence_date == occurrence_date,
        )

        return db.scalar(statement)

    # =====================================================
    # GARANTIR OCORRÊNCIA
    # =====================================================

    @staticmethod
    def get_or_create_occurrence(
        db: Session,
        task: Task,
        occurrence_date: date,
    ) -> TaskOccurrence:

        occurrence = TaskService.get_occurrence(
            db=db,
            task=task,
            occurrence_date=occurrence_date,
        )

        if occurrence is not None:
            return occurrence

        occurrence = TaskOccurrence(
            task_id=task.id,
            occurrence_date=occurrence_date,
            status=TaskOccurrenceStatus.PENDING,
        )

        db.add(occurrence)
        db.flush()

        return occurrence

    # =====================================================
    # SINCRONIZAR OCORRÊNCIAS
    #
    # Usado quando realmente queremos persistir
    # ocorrências no banco.
    # =====================================================

    @staticmethod
    def ensure_occurrences(
        db: Session,
        task: Task,
        start_date: date,
        end_date: date,
    ) -> list[TaskOccurrence]:

        occurrence_dates = TaskService.generate_recurrence_dates(
            task=task,
            start_date=start_date,
            end_date=end_date,
        )

        occurrences: list[TaskOccurrence] = []

        for occurrence_date in occurrence_dates:

            occurrence = TaskService.get_or_create_occurrence(
                db=db,
                task=task,
                occurrence_date=occurrence_date,
            )

            occurrences.append(occurrence)

        db.commit()

        for occurrence in occurrences:
            db.refresh(occurrence)

        return occurrences

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

        # -------------------------------------------------
        # PRIMEIRA OCORRÊNCIA
        # -------------------------------------------------

        TaskService.get_or_create_occurrence(
            db=db,
            task=task,
            occurrence_date=task.scheduled_date,
        )

        # -------------------------------------------------
        # PRÓXIMA OCORRÊNCIA
        # -------------------------------------------------

        task.next_recurrence_date = (
            TaskService._calculate_next_recurrence_date(
                task=task,
            )
        )

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
    # LISTAGEM NORMAL
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
    # LISTAGEM COM RECORRÊNCIA
    #
    # IMPORTANTE:
    #
    # Este método NÃO cria ocorrências no banco apenas
    # porque estamos consultando a lista.
    #
    # Se a ocorrência já existe, usamos ela.
    #
    # Se não existe, criamos um objeto temporário em memória
    # para representar a ocorrência.
    # =====================================================

    @staticmethod
    def list_with_recurrence(
        db: Session,
        user: User,
        start_date: date,
        end_date: date,
    ) -> list[tuple[Task, date, TaskOccurrence]]:

        if start_date > end_date:
            return []

        statement = select(Task).where(
            Task.user_id == user.id,
            Task.scheduled_date <= end_date,
        )

        tasks = list(
            db.scalars(statement).all()
        )

        result: list[
            tuple[Task, date, TaskOccurrence]
        ] = []

        for task in tasks:

            occurrence_dates = (
                TaskService.generate_recurrence_dates(
                    task=task,
                    start_date=start_date,
                    end_date=end_date,
                )
            )

            for occurrence_date in occurrence_dates:

                occurrence = TaskService.get_occurrence(
                    db=db,
                    task=task,
                    occurrence_date=occurrence_date,
                )

                # -------------------------------------------------
                # OCORRÊNCIA JÁ EXISTE
                # -------------------------------------------------

                if occurrence is not None:

                    result.append(
                        (
                            task,
                            occurrence_date,
                            occurrence,
                        )
                    )

                    continue

                # -------------------------------------------------
                # OCORRÊNCIA AINDA NÃO EXISTE
                #
                # NÃO SALVAMOS NO BANCO.
                # Apenas representamos a ocorrência em memória.
                # -------------------------------------------------

                occurrence = TaskOccurrence(
                    task_id=task.id,
                    occurrence_date=occurrence_date,
                    status=TaskOccurrenceStatus.PENDING,
                )

                result.append(
                    (
                        task,
                        occurrence_date,
                        occurrence,
                    )
                )

        result.sort(
            key=lambda item: (
                item[1],
                item[0].scheduled_time or "99:99",
                item[0].created_at,
            )
        )

        return result

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

        # -------------------------------------------------
        # RECORRÊNCIA
        # -------------------------------------------------

        if not task.is_recurring:

            task.next_recurrence_date = None

        else:

            task.next_recurrence_date = (
                TaskService._calculate_next_recurrence_date(
                    task=task,
                )
            )

        # -------------------------------------------------
        # CONCLUSÃO DA TAREFA PRINCIPAL
        # -------------------------------------------------

        if task.status == TaskStatus.COMPLETED:

            if previous_status != TaskStatus.COMPLETED:
                task.completed_at = datetime.now(
                    timezone.utc
                )

        else:

            task.completed_at = None

        db.commit()
        db.refresh(task)

        return task

    # =====================================================
    # CONCLUIR OCORRÊNCIA
    # =====================================================

    @staticmethod
    def complete_occurrence(
        db: Session,
        task: Task,
        occurrence_date: date,
    ) -> TaskOccurrence:

        occurrence = TaskService.get_or_create_occurrence(
            db=db,
            task=task,
            occurrence_date=occurrence_date,
        )

        occurrence.status = TaskOccurrenceStatus.COMPLETED
        occurrence.completed_at = datetime.now(
            timezone.utc
        )

        db.commit()
        db.refresh(occurrence)

        return occurrence

    # =====================================================
    # REABRIR OCORRÊNCIA
    # =====================================================

    @staticmethod
    def reopen_occurrence(
        db: Session,
        task: Task,
        occurrence_date: date,
    ) -> TaskOccurrence:

        occurrence = TaskService.get_or_create_occurrence(
            db=db,
            task=task,
            occurrence_date=occurrence_date,
        )

        occurrence.status = TaskOccurrenceStatus.PENDING
        occurrence.completed_at = None

        db.commit()
        db.refresh(occurrence)

        return occurrence

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