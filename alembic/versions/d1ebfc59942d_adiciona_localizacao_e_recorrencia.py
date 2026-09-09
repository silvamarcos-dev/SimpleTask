"""adiciona localizacao e recorrencia

Revision ID: d1ebfc59942d
Revises: 3b313694f9c5
Create Date: 2026-09-08 11:54:01.020250

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "d1ebfc59942d"

down_revision: Union[str, Sequence[str], None] = "3b313694f9c5"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # =====================================================
    # LOCALIZAÇÃO
    # =====================================================

    op.add_column(
        "tasks",
        sa.Column(
            "building",
            sa.String(length=150),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "block",
            sa.String(length=50),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "apartment",
            sa.String(length=50),
            nullable=True,
        ),
    )

    # =====================================================
    # RECORRÊNCIA
    # =====================================================

    op.add_column(
        "tasks",
        sa.Column(
            "is_recurring",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "recurrence_interval_months",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.add_column(
        "tasks",
        sa.Column(
            "next_recurrence_date",
            sa.Date(),
            nullable=True,
        ),
    )

    op.create_index(
        "ix_tasks_next_recurrence_date",
        "tasks",
        ["next_recurrence_date"],
        unique=False,
    )

    # Remove o default depois que as tarefas existentes
    # receberem false.
    op.alter_column(
        "tasks",
        "is_recurring",
        server_default=None,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_tasks_next_recurrence_date",
        table_name="tasks",
    )

    op.drop_column(
        "tasks",
        "next_recurrence_date",
    )

    op.drop_column(
        "tasks",
        "recurrence_interval_months",
    )

    op.drop_column(
        "tasks",
        "is_recurring",
    )

    op.drop_column(
        "tasks",
        "apartment",
    )

    op.drop_column(
        "tasks",
        "block",
    )

    op.drop_column(
        "tasks",
        "building",
    )