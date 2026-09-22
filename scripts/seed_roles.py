from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.permission import Permission
from app.models.role import Role


ADMIN_ROLE = "Administrador"
COLLABORATOR_ROLE = "Colaborador"


ADMIN_PERMISSIONS = [
    "tasks.view",
    "tasks.view_all",
    "tasks.create",
    "tasks.create_all",
    "tasks.update",
    "tasks.update_all",
    "tasks.delete",
    "tasks.delete_all",
    "departments.view",
    "departments.create",
    "departments.update",
    "departments.delete",
    "users.view",
    "users.create",
    "users.update",
    "users.delete",
]

COLLABORATOR_PERMISSIONS = [
    "tasks.view",
    "tasks.view_all",
    "tasks.create",
    "tasks.update",
    "tasks.delete",
]


def get_or_create_role(
    db,
    role_name: str,
) -> Role:
    role = db.scalar(
        select(Role).where(
            Role.name == role_name
        )
    )

    if role is not None:
        print(f"Role já existe: {role.name}")
        return role

    role = Role(
        name=role_name,
        company_id=1,
    )

    db.add(role)
    db.flush()

    print(
        f"Role criada: "
        f"{role.name} (ID {role.id})"
    )

    return role


def assign_permissions(
    db,
    role: Role,
    permission_names: list[str],
) -> None:
    permissions = db.scalars(
        select(Permission).where(
            Permission.name.in_(permission_names)
        )
    ).all()

    permissions_by_name = {
        permission.name: permission
        for permission in permissions
    }

    missing_permissions = [
        name
        for name in permission_names
        if name not in permissions_by_name
    ]

    if missing_permissions:
        raise RuntimeError(
            "Permissões não encontradas: "
            + ", ".join(missing_permissions)
        )

    role.permissions = [
        permissions_by_name[name]
        for name in permission_names
    ]

    print(
        f"{role.name}: "
        f"{len(role.permissions)} permissões associadas."
    )


def seed_roles() -> None:
    db = SessionLocal()

    try:
        admin_role = get_or_create_role(
            db,
            ADMIN_ROLE,
        )

        collaborator_role = get_or_create_role(
            db,
            COLLABORATOR_ROLE,
        )

        assign_permissions(
            db,
            admin_role,
            ADMIN_PERMISSIONS,
        )

        assign_permissions(
            db,
            collaborator_role,
            COLLABORATOR_PERMISSIONS,
        )

        db.commit()

        print()
        print("Seed de roles concluído.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()