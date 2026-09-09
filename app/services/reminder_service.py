from collections import defaultdict
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import Task, TaskStatus, UrgencyLevel
from app.models.user import User


class ReminderService:
    @staticmethod
    def get_tomorrow_tasks(
        db: Session,
        user: User,
    ) -> list[Task]:
        tomorrow = date.today() + timedelta(days=1)

        statement = (
            select(Task)
            .where(
                Task.user_id == user.id,
                Task.scheduled_date == tomorrow,
                Task.status != TaskStatus.COMPLETED,
            )
            .order_by(
                Task.scheduled_time.asc(),
                Task.created_at.asc(),
            )
        )

        return list(db.scalars(statement).all())

    @staticmethod
    def build_message(
        user: User,
        tasks: list[Task],
    ) -> str:
        if not tasks:
            return (
                f"Olá {user.name}! "
                "Você não possui tarefas pendentes para amanhã."
            )

        grouped_tasks: dict[UrgencyLevel, list[Task]] = defaultdict(list)

        for task in tasks:
            grouped_tasks[task.urgency].append(task)

        tomorrow = tasks[0].scheduled_date

        month_names = (
            "janeiro",
            "fevereiro",
            "março",
            "abril",
            "maio",
            "junho",
            "julho",
            "agosto",
            "setembro",
            "outubro",
            "novembro",
            "dezembro",
        )

        month = month_names[tomorrow.month - 1]

        lines = [
            f"Olá {user.name}!",
            "",
            (
                f"No dia {tomorrow.day} de {month}, "
                "você terá as seguintes tarefas:"
            ),
            "",
        ]

        urgency_labels = {
            UrgencyLevel.HIGH: "🔴 ALTA URGÊNCIA",
            UrgencyLevel.MEDIUM: "🟡 MÉDIA URGÊNCIA",
            UrgencyLevel.LOW: "🔵 BAIXA URGÊNCIA",
        }

        urgency_order = (
            UrgencyLevel.HIGH,
            UrgencyLevel.MEDIUM,
            UrgencyLevel.LOW,
        )

        for urgency in urgency_order:
            urgency_tasks = grouped_tasks.get(urgency, [])

            if not urgency_tasks:
                continue

            lines.append(urgency_labels[urgency])

            for task in urgency_tasks:
                if task.scheduled_time:
                    time_text = task.scheduled_time.strftime("%H:%M")
                    lines.append(
                        f"- {time_text} — {task.title}"
                    )
                else:
                    lines.append(
                        f"- {task.title}"
                    )

            lines.append("")

        lines.append("Bom trabalho amanhã! 🚀")

        return "\n".join(lines)