from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.user import User


class GoogleAccount(Base):
    __tablename__ = "google_accounts"

    # =====================================================
    # IDENTIFICAÇÃO
    # =====================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        unique=True,
        index=True,
    )

    google_id: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    # =====================================================
    # CREDENCIAIS GOOGLE
    # =====================================================

    access_token: Mapped[str | None] = mapped_column(
        String(4096),
        nullable=True,
    )

    refresh_token: Mapped[str | None] = mapped_column(
        String(4096),
        nullable=True,
    )

    token_expires_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # =====================================================
    # RELACIONAMENTO
    # =====================================================

    user: Mapped["User"] = relationship(
        back_populates="google_account",
    )