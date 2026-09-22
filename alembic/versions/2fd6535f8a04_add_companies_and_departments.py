"""add companies and departments

Revision ID: 2fd6535f8a04
Revises: 5599834ad3ea
Create Date: 2026-09-21 10:42:33.397319
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2fd6535f8a04"
down_revision: Union[str, Sequence[str], None] = "5599834ad3ea"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "companies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "name",
            sa.String(length=150),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_companies_id"),
        "companies",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_companies_name"),
        "companies",
        ["name"],
        unique=True,
    )

    op.create_table(
        "departments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "company_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["company_id"],
            ["companies.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_departments_id"),
        "departments",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_departments_name"),
        "departments",
        ["name"],
        unique=False,
    )

    op.create_index(
        op.f("ix_departments_company_id"),
        "departments",
        ["company_id"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_departments_company_id"),
        table_name="departments",
    )

    op.drop_index(
        op.f("ix_departments_name"),
        table_name="departments",
    )

    op.drop_index(
        op.f("ix_departments_id"),
        table_name="departments",
    )

    op.drop_table("departments")

    op.drop_index(
        op.f("ix_companies_name"),
        table_name="companies",
    )

    op.drop_index(
        op.f("ix_companies_id"),
        table_name="companies",
    )

    op.drop_table("companies")