"""adiciona tipo de recorrencia nas tarefas

Revision ID: e2caf1b1ced9
Revises: 71907d97acf0
Create Date: 2026-09-14 09:07:15.132966

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e2caf1b1ced9"
down_revision: Union[str, Sequence[str], None] = "71907d97acf0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    recurrence_type_enum = sa.Enum(
        "NONE",
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        name="recurrence_type",
    )

    # =====================================================
    # 1. CRIA O ENUM
    # =====================================================

    recurrence_type_enum.create(
        op.get_bind(),
        checkfirst=True,
    )

    # =====================================================
    # 2. ADICIONA A COLUNA TEMPORARIAMENTE COMO NULL
    # =====================================================

    op.add_column(
        "tasks",
        sa.Column(
            "recurrence_type",
            recurrence_type_enum,
            nullable=True,
        ),
    )

    # =====================================================
    # 3. ATUALIZA TAREFAS EXISTENTES
    # =====================================================

    op.execute(
        """
        UPDATE tasks
        SET recurrence_type = 'NONE'
        WHERE recurrence_type IS NULL
        """
    )

    # =====================================================
    # 4. TORNA A COLUNA OBRIGATÓRIA
    # =====================================================

    op.alter_column(
        "tasks",
        "recurrence_type",
        existing_type=recurrence_type_enum,
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Remove a coluna.
    op.drop_column(
        "tasks",
        "recurrence_type",
    )

    # Remove o ENUM.
    recurrence_type_enum = sa.Enum(
        "NONE",
        "DAILY",
        "WEEKLY",
        "MONTHLY",
        name="recurrence_type",
    )

    recurrence_type_enum.drop(
        op.get_bind(),
        checkfirst=True,
    )