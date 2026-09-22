from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.role import Role
from app.models.user import User


USER_ROLES = {
    "luislegal21@gmail.com": "Administrador",
    "1609.marcos.silva@gmail.com": "Administrador",
}


def assign_roles() -> None:
    db = SessionLocal()

    try:
        for email, role_name in USER_ROLES.items():
            user = db.scalar(
                select(User).where(
                    User.email == email
                )
            )

            if user is None:
                raise RuntimeError(
                    f"Usuário não encontrado: {email}"
                )

            role = db.scalar(
                select(Role).where(
                    Role.name == role_name,
                    Role.company_id == user.company_id,
                )
            )

            if role is None:
                raise RuntimeError(
                    f"Role não encontrada: "
                    f"{role_name}"
                )

            user.role_id = role.id

            print(
                f"{user.name} → "
                f"{user.department.name} → "
                f"{role.name}"
            )

        db.commit()

        print()
        print("Roles dos usuários atualizadas com sucesso.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    assign_roles()