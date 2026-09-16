from datetime import date

from sqlalchemy.orm import Session

from app.models.task import UrgencyLevel
from app.models.task_occurrence import TaskOccurrenceStatus
from app.models.user import User
from app.services.task_service import TaskService


class DashboardService:

    @staticmethod
    def get_today_summary(
        db: Session,
        user: User,
        target_date: date | None = None,
    ) -> dict:

        if target_date is None:
            target_date = date.today()

        # =====================================================
        # BUSCAR TAREFAS E OCORRÊNCIAS DA DATA
        # =====================================================

        task_occurrences = (
            TaskService.list_with_recurrence(
                db=db,
                user=user,
                start_date=target_date,
                end_date=target_date,
            )
        )

        # =====================================================
        # FILTRAR OCORRÊNCIAS DA DATA
        # =====================================================

        occurrences = [
            (task, occurrence)
            for task, occurrence_date, occurrence
            in task_occurrences
            if occurrence_date == target_date
        ]

        # =====================================================
        # TOTAL
        # =====================================================

        total = len(occurrences)

        # =====================================================
        # CONCLUÍDAS
        # =====================================================

        completed = sum(
            1
            for task, occurrence in occurrences
            if occurrence.status == TaskOccurrenceStatus.COMPLETED
        )

        # =====================================================
        # PENDENTES
        # =====================================================

        pending = sum(
            1
            for task, occurrence in occurrences
            if occurrence.status != TaskOccurrenceStatus.COMPLETED
        )

        # =====================================================
        # URGÊNCIA
        # =====================================================

        low = sum(
            1
            for task, occurrence in occurrences
            if task.urgency == UrgencyLevel.LOW
        )

        medium = sum(
            1
            for task, occurrence in occurrences
            if task.urgency == UrgencyLevel.MEDIUM
        )

        high = sum(
            1
            for task, occurrence in occurrences
            if task.urgency == UrgencyLevel.HIGH
        )

        # =====================================================
        # PROGRESSO
        # =====================================================

        completion_percentage = (
            round(
                (completed / total) * 100,
                2,
            )
            if total > 0
            else 0.0
        )

        # =====================================================
        # RESPONSE
        # =====================================================

        return {
            "date": target_date,
            "total": total,
            "completed": completed,
            "pending": pending,
            "by_urgency": {
                "baixa": low,
                "media": medium,
                "alta": high,
            },
            "completion_percentage": completion_percentage,
        }