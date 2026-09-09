from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.user import User
from app.services.reminder_service import ReminderService


class NotificationService:
    @staticmethod
    def send_tomorrow_reminder(
        db: Session,
        user: User,
    ) -> str | None:
        tasks = ReminderService.get_tomorrow_tasks(
            db,
            user,
        )

        if not tasks:
            return None

        message = ReminderService.build_message(
            user,
            tasks,
        )

        NotificationService._send(
            user,
            message,
        )

        return message

    @staticmethod
    def _send(
        user: User,
        message: str,
    ) -> None:
        timestamp = datetime.now(timezone.utc)

        print(
            "\n"
            "==============================\n"
            "       TASK REMINDER\n"
            "==============================\n"
            f"Usuário: {user.name}\n"
            f"E-mail: {user.email}\n"
            f"Horário: {timestamp.isoformat()}\n"
            "\n"
            f"{message}\n"
            "==============================\n"
        )