"""add unique constraint to departments

Revision ID: 7840008f2311
Revises: 2fd6535f8a04
Create Date: 2026-09-21
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "7840008f2311"
down_revision: Union[str, Sequence[str], None] = "2fd6535f8a04"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_unique_constraint(
        "uq_department_company_name",
        "departments",
        ["company_id", "name"],
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "uq_department_company_name",
        "departments",
        type_="unique",
    )