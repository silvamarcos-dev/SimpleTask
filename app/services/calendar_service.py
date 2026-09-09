from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task
from app.models.user import User


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

        statement = (
            select(Task)
            .where(
                Task.user_id == user.id,
                Task.scheduled_date >= start_date,
                Task.scheduled_date <= end_date,
            )
            .order_by(
                Task.scheduled_date.asc(),
                Task.scheduled_time.asc(),
                Task.created_at.asc(),
            )
        )

        tasks = db.scalars(statement).all()

        calendar: dict[date, list[Task]] = {}

        current_date = start_date

        while current_date <= end_date:
            calendar[current_date] = []
            current_date += timedelta(days=1)

        for task in tasks:
            calendar[task.scheduled_date].append(task)

        return calendar