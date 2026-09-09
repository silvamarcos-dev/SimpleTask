from datetime import date, datetime, time
from enum import Enum

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
    func,
)
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


class UrgencyLevel(str, Enum):
    LOW = "baixa"
    MEDIUM = "media"
    HIGH = "alta"


class TaskStatus(str, Enum):
    PENDING = "pendente"
    IN_PROGRESS = "em_andamento"
    COMPLETED = "concluida"


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    urgency: Mapped[UrgencyLevel] = mapped_column(
        SQLEnum(
            UrgencyLevel,
            name="urgency_level",
        ),
        nullable=False,
        default=UrgencyLevel.MEDIUM,
    )

    status: Mapped[TaskStatus] = mapped_column(
        SQLEnum(
            TaskStatus,
            name="task_status",
        ),
        nullable=False,
        default=TaskStatus.PENDING,
    )

    scheduled_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    scheduled_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    # =====================================================
    # LOCALIZAÇÃO
    # =====================================================

    building: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    block: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    apartment: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # =====================================================
    # RECORRÊNCIA
    # =====================================================

    is_recurring: Mapped[bool] = mapped_column(
        default=False,
        nullable=False,
    )

    recurrence_interval_months: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    next_recurrence_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        index=True,
    )

    # =====================================================
    # CONCLUSÃO
    # =====================================================

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # RELACIONAMENTO
    # =====================================================

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="tasks",
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

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