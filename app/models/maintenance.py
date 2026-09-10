from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.user import User


class MaintenancePriority(str, Enum):
    LOW = "baixa"
    MEDIUM = "media"
    HIGH = "alta"


class MaintenanceStatus(str, Enum):
    PENDING = "pendente"
    IN_PROGRESS = "em_andamento"
    WAITING = "agendada"
    COMPLETED = "concluida"


class ProviderType(str, Enum):
    PERSON = "pessoa"
    COMPANY = "empresa"


class Maintenance(Base):
    __tablename__ = "maintenances"

    # =====================================================
    # IDENTIFICAÇÃO
    # =====================================================

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
    # CLASSIFICAÇÃO
    # =====================================================

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    priority: Mapped[MaintenancePriority] = mapped_column(
        SQLEnum(
            MaintenancePriority,
            name="maintenance_priority",
        ),
        nullable=False,
        default=MaintenancePriority.MEDIUM,
    )

    status: Mapped[MaintenanceStatus] = mapped_column(
        SQLEnum(
            MaintenanceStatus,
            name="maintenance_status",
        ),
        nullable=False,
        default=MaintenanceStatus.PENDING,
    )

    # =====================================================
    # PRESTADOR DE SERVIÇO
    # =====================================================

    provider_type: Mapped[ProviderType | None] = mapped_column(
        SQLEnum(
            ProviderType,
            name="provider_type",
        ),
        nullable=True,
    )

    provider_name: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )

    provider_phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    # =====================================================
    # AGENDAMENTO
    # =====================================================

    scheduled_date: Mapped[date | None] = mapped_column(
        Date,
        nullable=True,
        index=True,
    )

    # =====================================================
    # OBSERVAÇÕES
    # =====================================================

    notes: Mapped[str | None] = mapped_column(
        Text,
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
        back_populates="maintenances",
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