from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus, UrgencyLevel
from app.models.user import User


class DashboardService:
    @staticmethod
    def get_today_summary(
        db: Session,
        user: User,
        target_date: date | None = None,
    ) -> dict:
        if target_date is None:
            target_date = date.today()

        base_filter = (
            Task.user_id == user.id,
            Task.scheduled_date == target_date,
        )

        total = db.scalar(
            select(func.count(Task.id)).where(
                *base_filter,
            )
        ) or 0

        completed = db.scalar(
            select(func.count(Task.id)).where(
                *base_filter,
                Task.status == TaskStatus.COMPLETED,
            )
        ) or 0

        pending = db.scalar(
            select(func.count(Task.id)).where(
                *base_filter,
                Task.status != TaskStatus.COMPLETED,
            )
        ) or 0

        low = db.scalar(
            select(func.count(Task.id)).where(
                *base_filter,
                Task.urgency == UrgencyLevel.LOW,
            )
        ) or 0

        medium = db.scalar(
            select(func.count(Task.id)).where(
                *base_filter,
                Task.urgency == UrgencyLevel.MEDIUM,
            )
        ) or 0

        high = db.scalar(
            select(func.count(Task.id)).where(
                *base_filter,
                Task.urgency == UrgencyLevel.HIGH,
            )
        ) or 0

        completion_percentage = (
            round((completed / total) * 100, 2)
            if total > 0
            else 0.0
        )

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