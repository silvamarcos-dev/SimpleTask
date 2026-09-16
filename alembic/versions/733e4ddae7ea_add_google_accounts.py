"""add google accounts

Revision ID: 733e4ddae7ea
Revises: 3fc5f79cd91c
Create Date: 2026-09-16 11:06:30.192120

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "733e4ddae7ea"
down_revision: Union[str, Sequence[str], None] = "3fc5f79cd91c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(
        "google_accounts",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "google_id",
            sa.String(length=255),
            nullable=False,
        ),
        sa.Column(
            "access_token",
            sa.String(length=4096),
            nullable=True,
        ),
        sa.Column(
            "refresh_token",
            sa.String(length=4096),
            nullable=True,
        ),
        sa.Column(
            "token_expires_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_google_accounts_google_id"),
        "google_accounts",
        ["google_id"],
        unique=True,
    )

    op.create_index(
        op.f("ix_google_accounts_id"),
        "google_accounts",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_google_accounts_user_id"),
        "google_accounts",
        ["user_id"],
        unique=True,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        op.f("ix_google_accounts_user_id"),
        table_name="google_accounts",
    )

    op.drop_index(
        op.f("ix_google_accounts_id"),
        table_name="google_accounts",
    )

    op.drop_index(
        op.f("ix_google_accounts_google_id"),
        table_name="google_accounts",
    )

    op.drop_table("google_accounts")