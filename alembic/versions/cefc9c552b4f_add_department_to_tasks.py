"""add department to tasks

Revision ID: cefc9c552b4f

Revises: 0a11dcd1331d

Create Date: 2026-09-21

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "cefc9c552b4f"

down_revision: Union[str, Sequence[str], None] = "0a11dcd1331d"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # =====================================================
    # 1. ADICIONAR COLUNA TEMPORARIAMENTE NULLABLE
    # =====================================================

    op.add_column(
        "tasks",
        sa.Column(
            "department_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    # =====================================================
    # 2. PREENCHER TAREFAS EXISTENTES
    #
    # O departamento da tarefa será herdado do departamento
    # atual do usuário que criou a tarefa.
    # =====================================================

    op.execute(
        """
        UPDATE tasks
        SET department_id = users.department_id
        FROM users
        WHERE tasks.user_id = users.id
        """
    )

    # =====================================================
    # 3. GARANTIR QUE TODAS AS TAREFAS FORAM ASSOCIADAS
    # =====================================================

    connection = op.get_bind()

    remaining_tasks = connection.execute(
        sa.text(
            """
            SELECT COUNT(*)
            FROM tasks
            WHERE department_id IS NULL
            """
        )
    ).scalar_one()

    if remaining_tasks != 0:
        raise RuntimeError(
            "Existem tarefas sem departamento após a migração."
        )

    # =====================================================
    # 4. CRIAR FOREIGN KEY
    # =====================================================

    op.create_foreign_key(
        "fk_tasks_department_id_departments",
        "tasks",
        "departments",
        ["department_id"],
        ["id"],
        ondelete="RESTRICT",
    )

    # =====================================================
    # 5. TORNAR O CAMPO OBRIGATÓRIO
    # =====================================================

    op.alter_column(
        "tasks",
        "department_id",
        existing_type=sa.Integer(),
        nullable=False,
    )

    # =====================================================
    # 6. ÍNDICE
    # =====================================================

    op.create_index(
        "ix_tasks_department_id",
        "tasks",
        ["department_id"],
        unique=False,
    )


def downgrade() -> None:
    # =====================================================
    # REMOVER ÍNDICE
    # =====================================================

    op.drop_index(
        "ix_tasks_department_id",
        table_name="tasks",
    )

    # =====================================================
    # REMOVER FOREIGN KEY
    # =====================================================

    op.drop_constraint(
        "fk_tasks_department_id_departments",
        "tasks",
        type_="foreignkey",
    )

    # =====================================================
    # REMOVER COLUNA
    # =====================================================

    op.drop_column(
        "tasks",
        "department_id",
    )