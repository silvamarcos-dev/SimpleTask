from apscheduler.schedulers.background import BackgroundScheduler

from sqlalchemy import select

from app.core.config import get_settings
from app.database.database import SessionLocal
from app.models.user import User
from app.services.notification_service import NotificationService
from app.services.recurrence_service import RecurrenceService


settings = get_settings()

scheduler = BackgroundScheduler()


def process_recurring_tasks() -> None:
    db = SessionLocal()

    try:
        RecurrenceService.process_due_tasks(db)
    finally:
        db.close()


def send_daily_reminders() -> None:
    db = SessionLocal()

    try:
        users = db.scalars(
            select(User),
        ).all()

        for user in users:
            NotificationService.send_tomorrow_reminder(
                db,
                user,
            )
    finally:
        db.close()


def run_daily_jobs() -> None:
    process_recurring_tasks()
    send_daily_reminders()


def start_scheduler() -> None:
    if scheduler.running:
        return

    scheduler.add_job(
        run_daily_jobs,
        trigger="cron",
        hour=settings.reminder_hour,
        minute=settings.reminder_minute,
        id="daily_task_jobs",
        replace_existing=True,
    )

    scheduler.start()


def stop_scheduler() -> None:
    if not scheduler.running:
        return

    scheduler.shutdown(
        wait=False,
    )