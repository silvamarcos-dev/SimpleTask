"""add marketing posts

Revision ID: a1cfdf9a0512

Revises: cefc9c552b4f

Create Date: 2026-09-22 08:21:41.101340

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = "a1cfdf9a0512"
down_revision: Union[str, Sequence[str], None] = "cefc9c552b4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "marketing_posts",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "title",
            sa.String(length=200),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.Text(),
            nullable=True,
        ),
        sa.Column(
            "scheduled_date",
            sa.Date(),
            nullable=False,
        ),
        sa.Column(
            "scheduled_time",
            sa.Time(),
            nullable=True,
        ),
        sa.Column(
            "platform",
            sa.Enum(
                "instagram",
                "facebook",
                "linkedin",
                "tiktok",
                name="marketing_platform",
            ),
            nullable=False,
        ),
        sa.Column(
            "content_type",
            sa.Enum(
                "feed",
                "story",
                "reels",
                "carousel",
                name="marketing_content_type",
            ),
            nullable=False,
        ),
        sa.Column(
            "status",
            sa.Enum(
                "planejado",
                "em_producao",
                "publicado",
                "cancelado",
                name="marketing_post_status",
            ),
            nullable=False,
        ),
        sa.Column(
            "company_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "created_by_id",
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
        sa.ForeignKeyConstraint(
            ["created_by_id"],
            ["users.id"],
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_marketing_posts_company_id"),
        "marketing_posts",
        ["company_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_marketing_posts_created_by_id"),
        "marketing_posts",
        ["created_by_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_marketing_posts_id"),
        "marketing_posts",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_marketing_posts_platform"),
        "marketing_posts",
        ["platform"],
        unique=False,
    )

    op.create_index(
        op.f("ix_marketing_posts_scheduled_date"),
        "marketing_posts",
        ["scheduled_date"],
        unique=False,
    )

    op.create_index(
        op.f("ix_marketing_posts_status"),
        "marketing_posts",
        ["status"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_marketing_posts_status"),
        table_name="marketing_posts",
    )

    op.drop_index(
        op.f("ix_marketing_posts_scheduled_date"),
        table_name="marketing_posts",
    )

    op.drop_index(
        op.f("ix_marketing_posts_platform"),
        table_name="marketing_posts",
    )

    op.drop_index(
        op.f("ix_marketing_posts_id"),
        table_name="marketing_posts",
    )

    op.drop_index(
        op.f("ix_marketing_posts_created_by_id"),
        table_name="marketing_posts",
    )

    op.drop_index(
        op.f("ix_marketing_posts_company_id"),
        table_name="marketing_posts",
    )

    op.drop_table("marketing_posts")