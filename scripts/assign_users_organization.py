from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.company import Company
from app.models.department import Department
from app.models.user import User


COMPANY_NAME = "Imobiliária Meta"

USER_DEPARTMENTS = {
    "luislegal21@gmail.com": "Diretoria",
    "1609.marcos.silva@gmail.com": "T.I",
}


def assign_users() -> None:
    db = SessionLocal()

    try:
        company = db.scalar(
            select(Company).where(
                Company.name == COMPANY_NAME
            )
        )

        if company is None:
            raise RuntimeError(
                f"Empresa não encontrada: {COMPANY_NAME}"
            )

        for email, department_name in USER_DEPARTMENTS.items():
            user = db.scalar(
                select(User).where(
                    User.email == email
                )
            )

            if user is None:
                raise RuntimeError(
                    f"Usuário não encontrado: {email}"
                )

            department = db.scalar(
                select(Department).where(
                    Department.company_id == company.id,
                    Department.name == department_name,
                )
            )

            if department is None:
                raise RuntimeError(
                    f"Departamento não encontrado: "
                    f"{department_name}"
                )

            user.company_id = company.id
            user.department_id = department.id

            print(
                f"{user.name} → "
                f"{company.name} → "
                f"{department.name}"
            )

        db.commit()

        print("\nUsuários vinculados com sucesso.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    assign_users()