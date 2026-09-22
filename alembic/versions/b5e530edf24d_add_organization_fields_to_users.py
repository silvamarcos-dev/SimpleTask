"""add organization fields to users

Revision ID: b5e530edf24d
Revises: 7840008f2311
Create Date: 2026-09-21 11:06:23.403384

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b5e530edf24d"
down_revision: Union[str, Sequence[str], None] = "7840008f2311"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "users",
        sa.Column(
            "company_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "users",
        sa.Column(
            "department_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        op.f("ix_users_company_id"),
        "users",
        ["company_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_users_department_id"),
        "users",
        ["department_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_users_company_id_companies",
        "users",
        "companies",
        ["company_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    op.create_foreign_key(
        "fk_users_department_id_departments",
        "users",
        "departments",
        ["department_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "fk_users_department_id_departments",
        "users",
        type_="foreignkey",
    )

    op.drop_constraint(
        "fk_users_company_id_companies",
        "users",
        type_="foreignkey",
    )

    op.drop_index(
        op.f("ix_users_department_id"),
        table_name="users",
    )

    op.drop_index(
        op.f("ix_users_company_id"),
        table_name="users",
    )

    op.drop_column(
        "users",
        "department_id",
    )

    op.drop_column(
        "users",
        "company_id",
    )