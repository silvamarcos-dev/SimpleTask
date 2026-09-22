from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.role import Role
    from app.models.user import User
    from app.models.marketing_post import MarketingPost

class Company(Base):
    __tablename__ = "companies"

    # =====================================================
    # IDENTIFICAÇÃO
    # =====================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        unique=True,
        index=True,
    )

    # =====================================================
    # RELACIONAMENTOS
    # =====================================================

    departments: Mapped[list["Department"]] = relationship(
        "Department",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="company",
    )

    roles: Mapped[list["Role"]] = relationship(
        "Role",
        back_populates="company",
        cascade="all, delete-orphan",
    )

    marketing_posts: Mapped[list["MarketingPost"]] = relationship(
    "MarketingPost",
    back_populates="company",
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