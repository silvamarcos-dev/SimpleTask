from sqlalchemy import select

from app.database.database import SessionLocal
from app.models.company import Company
from app.models.department import Department


COMPANY_NAME = "Imobiliária Meta"

DEPARTMENTS = [
    "Administrativo",
    "Locação",
    "Jurídico",
    "Vendas",
    "T.I",
    "Diretoria",
]


def seed_organization() -> None:
    db = SessionLocal()

    try:
        company = db.scalar(
            select(Company).where(
                Company.name == COMPANY_NAME
            )
        )

        if company is None:
            company = Company(name=COMPANY_NAME)
            db.add(company)
            db.flush()

            print(f"Empresa criada: {company.name} (ID {company.id})")
        else:
            print(
                f"Empresa já existe: "
                f"{company.name} (ID {company.id})"
            )

        existing_departments = {
            department.name
            for department in db.scalars(
                select(Department).where(
                    Department.company_id == company.id
                )
            ).all()
        }

        for department_name in DEPARTMENTS:
            if department_name in existing_departments:
                print(
                    f"Departamento já existe: "
                    f"{department_name}"
                )
                continue

            department = Department(
                name=department_name,
                company_id=company.id,
            )

            db.add(department)

            print(
                f"Departamento criado: "
                f"{department_name}"
            )

        db.commit()

        print("\nSeed da organização concluído.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_organization()