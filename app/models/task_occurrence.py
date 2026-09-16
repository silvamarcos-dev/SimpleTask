from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.task import Task


class TaskOccurrenceStatus(str, Enum):
    PENDING = "pendente"
    IN_PROGRESS = "em_andamento"
    COMPLETED = "concluida"


class TaskOccurrence(Base):
    __tablename__ = "task_occurrences"

    __table_args__ = (
        UniqueConstraint(
            "task_id",
            "occurrence_date",
            name="uq_task_occurrence_date",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    task_id: Mapped[int] = mapped_column(
        ForeignKey(
            "tasks.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    occurrence_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    status: Mapped[TaskOccurrenceStatus] = mapped_column(
        SQLEnum(
            TaskOccurrenceStatus,
            name="task_occurrence_status",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
        default=TaskOccurrenceStatus.PENDING,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    task: Mapped["Task"] = relationship(
        back_populates="occurrences",
    )