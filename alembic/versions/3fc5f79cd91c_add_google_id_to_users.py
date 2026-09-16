"""add google id to users

Revision ID: 3fc5f79cd91c
Revises: a605561ff7d9
Create Date: 2026-09-16 10:36:50.246628

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3fc5f79cd91c"
down_revision: Union[str, Sequence[str], None] = "a605561ff7d9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # =====================================================
    # GOOGLE LOGIN
    # =====================================================

    op.add_column(
        "users",
        sa.Column(
            "google_id",
            sa.String(length=255),
            nullable=True,
        ),
    )

    # Usuários que entram pelo Google não possuem
    # necessariamente uma senha local.
    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.VARCHAR(length=255),
        nullable=True,
    )

    # Cada conta Google deve estar vinculada a apenas
    # um usuário do Simple Task.
    op.create_index(
        op.f("ix_users_google_id"),
        "users",
        ["google_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    # =====================================================
    # GOOGLE LOGIN
    # =====================================================

    op.drop_index(
        op.f("ix_users_google_id"),
        table_name="users",
    )

    op.alter_column(
        "users",
        "password_hash",
        existing_type=sa.VARCHAR(length=255),
        nullable=False,
    )

    op.drop_column(
        "users",
        "google_id",
    )