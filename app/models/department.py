from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.database import Base


if TYPE_CHECKING:
    from app.models.company import Company
    from app.models.task import Task
    from app.models.user import User


class Department(Base):
    __tablename__ = "departments"

    __table_args__ = (
        UniqueConstraint(
            "company_id",
            "name",
            name="uq_department_company_name",
        ),
    )

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
        index=True,
    )

    # =====================================================
    # EMPRESA
    # =====================================================

    company_id: Mapped[int] = mapped_column(
        ForeignKey(
            "companies.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # =====================================================
    # RELACIONAMENTOS
    # =====================================================

    company: Mapped["Company"] = relationship(
        "Company",
        back_populates="departments",
    )

    users: Mapped[list["User"]] = relationship(
        "User",
        back_populates="department",
    )

    tasks: Mapped[list["Task"]] = relationship(
        "Task",
        back_populates="department",
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