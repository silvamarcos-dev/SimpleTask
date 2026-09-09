from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus


class RecurrenceService:
    @staticmethod
    def process_due_tasks(
        db: Session,
        target_date: date | None = None,
    ) -> int:
        if target_date is None:
            target_date = date.today()

        statement = select(Task).where(
            Task.is_recurring.is_(True),
            Task.status == TaskStatus.COMPLETED,
            Task.next_recurrence_date.is_not(None),
            Task.next_recurrence_date <= target_date,
        )

        tasks = list(
            db.scalars(statement).all()
        )

        processed = 0

        for task in tasks:
            task.status = TaskStatus.PENDING
            task.scheduled_date = (
                task.next_recurrence_date
            )
            task.completed_at = None
            task.next_recurrence_date = None

            processed += 1

        if processed > 0:
            db.commit()

        return processed