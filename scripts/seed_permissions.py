from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.permission import Permission


PERMISSIONS = [
    # =====================================================
    # TAREFAS
    # =====================================================

    {
        "name": "tasks.view",
        "description": "Visualizar tarefas do próprio escopo.",
    },
    {
        "name": "tasks.view_all",
        "description": "Visualizar tarefas de todos os departamentos.",
    },
    {
        "name": "tasks.create",
        "description": "Criar tarefas no próprio escopo.",
    },
    {
        "name": "tasks.create_all",
        "description": "Criar tarefas para qualquer departamento.",
    },
    {
        "name": "tasks.update",
        "description": "Editar tarefas do próprio escopo.",
    },
    {
        "name": "tasks.update_all",
        "description": "Editar tarefas de qualquer departamento.",
    },
    {
        "name": "tasks.delete",
        "description": "Excluir tarefas do próprio escopo.",
    },
    {
        "name": "tasks.delete_all",
        "description": "Excluir tarefas de qualquer departamento.",
    },

    # =====================================================
    # DEPARTAMENTOS
    # =====================================================

    {
        "name": "departments.view",
        "description": "Visualizar departamentos.",
    },
    {
        "name": "departments.create",
        "description": "Criar departamentos.",
    },
    {
        "name": "departments.update",
        "description": "Editar departamentos.",
    },
    {
        "name": "departments.delete",
        "description": "Excluir departamentos.",
    },

    # =====================================================
    # USUÁRIOS
    # =====================================================

    {
        "name": "users.view",
        "description": "Visualizar usuários.",
    },
    {
        "name": "users.create",
        "description": "Criar usuários.",
    },
    {
        "name": "users.update",
        "description": "Editar usuários.",
    },
    {
        "name": "users.delete",
        "description": "Excluir usuários.",
    },
]


def seed_permissions() -> None:
    db = SessionLocal()

    try:
        created = 0
        existing = 0

        for permission_data in PERMISSIONS:
            permission = db.scalar(
                select(Permission).where(
                    Permission.name == permission_data["name"]
                )
            )

            if permission is not None:
                existing += 1
                print(
                    f"Permissão já existe: "
                    f"{permission.name}"
                )
                continue

            permission = Permission(
                name=permission_data["name"],
                description=permission_data["description"],
            )

            db.add(permission)
            created += 1

            print(
                f"Permissão criada: "
                f"{permission.name}"
            )

        db.commit()

        print()
        print(
            f"Seed concluído: "
            f"{created} criadas, "
            f"{existing} já existentes."
        )

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_permissions()