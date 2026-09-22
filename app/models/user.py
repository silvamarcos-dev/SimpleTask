from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.apartment import Apartment
    from app.models.company import Company
    from app.models.department import Department
    from app.models.google_account import GoogleAccount
    from app.models.maintenance import Maintenance
    from app.models.role import Role
    from app.models.task import Task
    from app.models.marketing_post import MarketingPost

class User(Base):
    __tablename__ = "users"

    # =====================================================
    # IDENTIFICAÇÃO
    # =====================================================

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    google_id: Mapped[str | None] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=True,
    )

    # =====================================================
    # ORGANIZAÇÃO
    # =====================================================

    company_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )

    department_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "departments.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )

    role_id: Mapped[int | None] = mapped_column(
        ForeignKey(
            "roles.id",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )

    # =====================================================
    # RELACIONAMENTOS ORGANIZACIONAIS
    # =====================================================

    company: Mapped["Company | None"] = relationship(
        "Company",
        back_populates="users",
    )

    department: Mapped["Department | None"] = relationship(
        "Department",
        back_populates="users",
    )

    role: Mapped["Role | None"] = relationship(
        "Role",
        back_populates="users",
    )

    marketing_posts: Mapped[list["MarketingPost"]] = relationship(
        "MarketingPost",
        back_populates="created_by",
    )

    # =====================================================
    # RELACIONAMENTOS DO SISTEMA
    # =====================================================

    tasks: Mapped[list["Task"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    maintenances: Mapped[list["Maintenance"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    apartments: Mapped[list["Apartment"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )

    google_account: Mapped["GoogleAccount | None"] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
        uselist=False,
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