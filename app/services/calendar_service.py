from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus
from app.models.task_occurrence import TaskOccurrenceStatus
from app.models.user import User
from app.services.task_service import TaskService


class CalendarService:

    @staticmethod
    def get_tasks_by_period(
        db: Session,
        user: User,
        start_date: date,
        end_date: date,
    ) -> dict[date, list[Task]]:

        if end_date < start_date:
            raise ValueError(
                "A data final não pode ser anterior à data inicial."
            )

        # =====================================================
        # BUSCAR TAREFAS DO USUÁRIO
        # =====================================================

        statement = (
            select(Task)
            .where(
                Task.user_id == user.id,
                Task.scheduled_date <= end_date,
            )
            .order_by(
                Task.scheduled_date.asc(),
                Task.scheduled_time.asc(),
                Task.created_at.asc(),
            )
        )

        tasks = db.scalars(statement).all()

        # =====================================================
        # CRIAR ESTRUTURA DO CALENDÁRIO
        # =====================================================

        calendar: dict[date, list[Task]] = {}

        current_date = start_date

        while current_date <= end_date:
            calendar[current_date] = []
            current_date += timedelta(days=1)

        # =====================================================
        # EXPANDIR RECORRÊNCIAS
        # =====================================================

        for task in tasks:

            occurrence_dates = (
                TaskService.generate_recurrence_dates(
                    task=task,
                    start_date=start_date,
                    end_date=end_date,
                )
            )

            for occurrence_date in occurrence_dates:

                if occurrence_date not in calendar:
                    continue

                # =================================================
                # GARANTIR OCORRÊNCIA NO BANCO
                # =================================================

                occurrence = TaskService.get_or_create_occurrence(
                    db=db,
                    task=task,
                    occurrence_date=occurrence_date,
                )

                # =================================================
                # CRIAR REPRESENTAÇÃO DA OCORRÊNCIA
                # =================================================
                #
                # O calendário trabalha com Task.
                #
                # Portanto, usamos uma cópia do objeto para que
                # status e completed_at representem SOMENTE
                # aquela ocorrência.
                #
                # =================================================

                occurrence_task = Task(
                    id=task.id,
                    title=task.title,
                    description=task.description,

                    # IMPORTANTE:
                    # manter o departamento da tarefa original
                    department_id=task.department_id,

                    urgency=task.urgency,

                    status=TaskStatus(
                        occurrence.status.value
                    ),

                    scheduled_date=occurrence_date,
                    scheduled_time=task.scheduled_time,

                    building=task.building,
                    block=task.block,
                    apartment=task.apartment,

                    is_recurring=task.is_recurring,
                    recurrence_type=task.recurrence_type,
                    recurrence_interval=task.recurrence_interval,
                    next_recurrence_date=task.next_recurrence_date,

                    completed_at=occurrence.completed_at,

                    user_id=task.user_id,

                    created_at=task.created_at,
                    updated_at=task.updated_at,
                )

                calendar[occurrence_date].append(
                    occurrence_task
                )

        # =====================================================
        # COMMIT DAS OCORRÊNCIAS CRIADAS
        # =====================================================

        db.commit()

        # =====================================================
        # ORDENAR TAREFAS DE CADA DIA
        # =====================================================

        for calendar_date in calendar:

            calendar[calendar_date].sort(
                key=lambda task: (
                    task.scheduled_time or "99:99",
                    task.created_at,
                )
            )

        return calendar