"""add roles and permissions

Revision ID: 0a11dcd1331d
Revises: b5e530edf24d
Create Date: 2026-09-21 11:30:00.272175

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0a11dcd1331d"
down_revision: Union[str, Sequence[str], None] = "b5e530edf24d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # =====================================================
    # PERMISSIONS
    # =====================================================

    op.create_table(
        "permissions",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "description",
            sa.String(length=255),
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
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_permissions_id"),
        "permissions",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_permissions_name"),
        "permissions",
        ["name"],
        unique=True,
    )

    # =====================================================
    # ROLES
    # =====================================================

    op.create_table(
        "roles",
        sa.Column(
            "id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "name",
            sa.String(length=100),
            nullable=False,
        ),
        sa.Column(
            "company_id",
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
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        op.f("ix_roles_company_id"),
        "roles",
        ["company_id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_roles_id"),
        "roles",
        ["id"],
        unique=False,
    )

    op.create_index(
        op.f("ix_roles_name"),
        "roles",
        ["name"],
        unique=False,
    )

    # =====================================================
    # ROLE ↔ PERMISSION
    # =====================================================

    op.create_table(
        "role_permissions",
        sa.Column(
            "role_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "permission_id",
            sa.Integer(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["permission_id"],
            ["permissions.id"],
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["role_id"],
            ["roles.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint(
            "role_id",
            "permission_id",
        ),
    )

    # =====================================================
    # USER → ROLE
    # =====================================================

    op.add_column(
        "users",
        sa.Column(
            "role_id",
            sa.Integer(),
            nullable=True,
        ),
    )

    op.create_index(
        op.f("ix_users_role_id"),
        "users",
        ["role_id"],
        unique=False,
    )

    op.create_foreign_key(
        "fk_users_role_id_roles",
        "users",
        "roles",
        ["role_id"],
        ["id"],
        ondelete="RESTRICT",
    )


def downgrade() -> None:
    """Downgrade schema."""

    # =====================================================
    # USER → ROLE
    # =====================================================

    op.drop_constraint(
        "fk_users_role_id_roles",
        "users",
        type_="foreignkey",
    )

    op.drop_index(
        op.f("ix_users_role_id"),
        table_name="users",
    )

    op.drop_column(
        "users",
        "role_id",
    )

    # =====================================================
    # ROLE ↔ PERMISSION
    # =====================================================

    op.drop_table(
        "role_permissions",
    )

    # =====================================================
    # ROLES
    # =====================================================

    op.drop_index(
        op.f("ix_roles_name"),
        table_name="roles",
    )

    op.drop_index(
        op.f("ix_roles_id"),
        table_name="roles",
    )

    op.drop_index(
        op.f("ix_roles_company_id"),
        table_name="roles",
    )

    op.drop_table(
        "roles",
    )

    # =====================================================
    # PERMISSIONS
    # =====================================================

    op.drop_index(
        op.f("ix_permissions_name"),
        table_name="permissions",
    )

    op.drop_index(
        op.f("ix_permissions_id"),
        table_name="permissions",
    )

    op.drop_table(
        "permissions",
    )