"""adiciona ocorrencias de tarefas

Revision ID: 5599834ad3ea
Revises: 733e4ddae7ea
Create Date: 2026-09-16 13:11:23.894595

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "5599834ad3ea"
down_revision: Union[str, Sequence[str], None] = "733e4ddae7ea"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    task_occurrence_status = postgresql.ENUM(
        "pendente",
        "em_andamento",
        "concluida",
        name="task_occurrence_status",
    )

    task_occurrence_status.create(
        op.get_bind(),
        checkfirst=True,
    )

    op.create_table(
        "task_occurrences",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "task_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "occurrence_date",
            sa.Date(),
            nullable=False,
        ),
        sa.Column(
            "status",
            task_occurrence_status,
            nullable=False,
            server_default="pendente",
        ),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=True,
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
            ["task_id"],
            ["tasks.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "task_id",
            "occurrence_date",
            name="uq_task_occurrence_date",
        ),
    )

    op.create_index(
        "ix_task_occurrences_id",
        "task_occurrences",
        ["id"],
        unique=False,
    )

    op.create_index(
        "ix_task_occurrences_task_id",
        "task_occurrences",
        ["task_id"],
        unique=False,
    )

    op.create_index(
        "ix_task_occurrences_occurrence_date",
        "task_occurrences",
        ["occurrence_date"],
        unique=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "ix_task_occurrences_occurrence_date",
        table_name="task_occurrences",
    )

    op.drop_index(
        "ix_task_occurrences_task_id",
        table_name="task_occurrences",
    )

    op.drop_index(
        "ix_task_occurrences_id",
        table_name="task_occurrences",
    )

    op.drop_table("task_occurrences")

    task_occurrence_status = postgresql.ENUM(
        "pendente",
        "em_andamento",
        "concluida",
        name="task_occurrence_status",
    )

    task_occurrence_status.drop(
        op.get_bind(),
        checkfirst=True,
    )