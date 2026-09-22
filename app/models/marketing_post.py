from datetime import date, datetime, time
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, Time, func
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base

if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.user import User


class MarketingPlatform(str, Enum):
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"


class MarketingContentType(str, Enum):
    FEED = "feed"
    STORY = "story"
    REELS = "reels"
    CAROUSEL = "carousel"


class MarketingPostStatus(str, Enum):
    PLANNED = "planejado"
    IN_PRODUCTION = "em_producao"
    PUBLISHED = "publicado"
    CANCELLED = "cancelado"


class MarketingPost(Base):
    __tablename__ = "marketing_posts"

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

    scheduled_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        index=True,
    )

    scheduled_time: Mapped[time | None] = mapped_column(
        Time,
        nullable=True,
    )

    platform: Mapped[MarketingPlatform] = mapped_column(
        SQLEnum(
            MarketingPlatform,
            name="marketing_platform",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
        index=True,
    )

    content_type: Mapped[MarketingContentType] = mapped_column(
        SQLEnum(
            MarketingContentType,
            name="marketing_content_type",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
    )

    status: Mapped[MarketingPostStatus] = mapped_column(
        SQLEnum(
            MarketingPostStatus,
            name="marketing_post_status",
            values_callable=lambda enum_class: [
                member.value for member in enum_class
            ],
        ),
        nullable=False,
        default=MarketingPostStatus.PLANNED,
        index=True,
    )

    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    created_by_id: Mapped[int] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="marketing_posts",
    )

    created_by: Mapped["User"] = relationship(
        "User",
        back_populates="marketing_posts",
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