"""renomeia intervalo de recorrencia

Revision ID: a605561ff7d9
Revises: 826c3b82eb86
Create Date: 2026-09-14 12:41:31.454923

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a605561ff7d9"
down_revision: Union[str, Sequence[str], None] = "826c3b82eb86"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.alter_column(
        "tasks",
        "recurrence_interval_months",
        new_column_name="recurrence_interval",
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.alter_column(
        "tasks",
        "recurrence_interval",
        new_column_name="recurrence_interval_months",
    )