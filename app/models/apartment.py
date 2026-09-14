from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.user import User


class ApartmentStatus(str, Enum):
    ACTIVE = "ativo"
    INACTIVE = "inativo"
    MAINTENANCE = "manutencao"


class Apartment(Base):
    __tablename__ = "apartments"
    __table_args__ = {"schema": "public"}

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

    building: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    block: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    apartment: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    # =====================================================
    # STATUS
    # =====================================================

    status: Mapped[ApartmentStatus] = mapped_column(
        SQLEnum(
            ApartmentStatus,
            name="apartment_status",
        ),
        nullable=False,
        default=ApartmentStatus.ACTIVE,
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
        back_populates="apartments",
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