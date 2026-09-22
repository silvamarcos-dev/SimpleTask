from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.permissions import require_permission
from app.database.database import get_db
from app.models.department import Department
from app.models.user import User
from app.schemas.department import (
    DepartmentCreate,
    DepartmentResponse,
    DepartmentUpdate,
)


router = APIRouter(
    prefix="/departments",
    tags=["Departamentos"],
)


DbSession = Annotated[
    Session,
    Depends(get_db),
]


CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


# =========================================================
# LISTAR DEPARTAMENTOS
# =========================================================

@router.get(
    "",
    response_model=list[DepartmentResponse],
)
def list_departments(
    db: DbSession,
    current_user: User = Depends(
        require_permission("departments.view")
    ),
) -> list[DepartmentResponse]:

    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Usuário não está associado a uma empresa."
            ),
        )

    statement = (
        select(Department)
        .where(
            Department.company_id == current_user.company_id,
        )
        .order_by(
            Department.name.asc(),
        )
    )

    return list(
        db.scalars(statement).all()
    )


# =========================================================
# CRIAR DEPARTAMENTO
# =========================================================

@router.post(
    "",
    response_model=DepartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_department(
    department_data: DepartmentCreate,
    db: DbSession,
    current_user: User = Depends(
        require_permission("departments.create")
    ),
) -> DepartmentResponse:

    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Usuário não está associado a uma empresa."
            ),
        )

    name = department_data.name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "O nome do departamento "
                "não pode estar vazio."
            ),
        )

    # -----------------------------------------------------
    # VERIFICAR DUPLICIDADE NA EMPRESA
    # -----------------------------------------------------

    existing_department = db.scalar(
        select(Department).where(
            Department.company_id == current_user.company_id,
            Department.name == name,
        )
    )

    if existing_department is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Já existe um departamento com esse "
                "nome nesta empresa."
            ),
        )

    # -----------------------------------------------------
    # CRIAR
    # -----------------------------------------------------

    department = Department(
        name=name,
        company_id=current_user.company_id,
    )

    db.add(department)

    try:
        db.commit()
        db.refresh(department)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Já existe um departamento com esse "
                "nome nesta empresa."
            ),
        )

    return department


# =========================================================
# ATUALIZAR DEPARTAMENTO
# =========================================================

@router.patch(
    "/{department_id}",
    response_model=DepartmentResponse,
)
def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: DbSession,
    current_user: User = Depends(
        require_permission("departments.update")
    ),
) -> DepartmentResponse:

    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Usuário não está associado a uma empresa."
            ),
        )

    # -----------------------------------------------------
    # BUSCAR SOMENTE NA EMPRESA DO USUÁRIO
    # -----------------------------------------------------

    statement = select(Department).where(
        Department.id == department_id,
        Department.company_id == current_user.company_id,
    )

    department = db.scalar(statement)

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento não encontrado.",
        )

    # -----------------------------------------------------
    # VALIDAR NOME
    # -----------------------------------------------------

    if department_data.name is not None:

        name = department_data.name.strip()

        if not name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    "O nome do departamento "
                    "não pode estar vazio."
                ),
            )

        # -------------------------------------------------
        # VERIFICAR DUPLICIDADE
        # -------------------------------------------------

        duplicate = db.scalar(
            select(Department).where(
                Department.company_id == current_user.company_id,
                Department.name == name,
                Department.id != department.id,
            )
        )

        if duplicate is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=(
                    "Já existe um departamento com esse "
                    "nome nesta empresa."
                ),
            )

        department.name = name

    db.commit()
    db.refresh(department)

    return department


# =========================================================
# EXCLUIR DEPARTAMENTO
# =========================================================

@router.delete(
    "/{department_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_department(
    department_id: int,
    db: DbSession,
    current_user: User = Depends(
        require_permission("departments.delete")
    ),
) -> None:

    if current_user.company_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Usuário não está associado a uma empresa."
            ),
        )

    # -----------------------------------------------------
    # BUSCAR SOMENTE NA EMPRESA DO USUÁRIO
    # -----------------------------------------------------

    statement = select(Department).where(
        Department.id == department_id,
        Department.company_id == current_user.company_id,
    )

    department = db.scalar(statement)

    if department is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Departamento não encontrado.",
        )

    # -----------------------------------------------------
    # PROTEGER DEPARTAMENTO COM USUÁRIOS
    # -----------------------------------------------------

    users_count = db.scalar(
        select(
            __import__("sqlalchemy").func.count(User.id)
        ).where(
            User.department_id == department.id,
        )
    )

    if users_count and users_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Não é possível excluir um departamento "
                "que possui usuários associados."
            ),
        )

    # -----------------------------------------------------
    # PROTEGER DEPARTAMENTO COM TAREFAS
    # -----------------------------------------------------

    from app.models.task import Task

    tasks_count = db.scalar(
        select(
            __import__("sqlalchemy").func.count(Task.id)
        ).where(
            Task.department_id == department.id,
        )
    )

    if tasks_count and tasks_count > 0:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Não é possível excluir um departamento "
                "que possui tarefas associadas."
            ),
        )

    # -----------------------------------------------------
    # EXCLUIR
    # -----------------------------------------------------

    db.delete(department)
    db.commit()