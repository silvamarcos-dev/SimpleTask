from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.apartment import (
    ApartmentCreate,
    ApartmentResponse,
    ApartmentUpdate,
)
from app.services.apartment_service import ApartmentService


router = APIRouter(
    prefix="/apartments",
    tags=["Apartamentos"],
)


DbSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


# =====================================================
# CRIAR
# =====================================================

@router.post(
    "",
    response_model=ApartmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_apartment(
    apartment_data: ApartmentCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> ApartmentResponse:
    return ApartmentService.create(
        db,
        apartment_data,
        current_user.id,
    )


# =====================================================
# LISTAR
# =====================================================

@router.get(
    "",
    response_model=list[ApartmentResponse],
)
def list_apartments(
    db: DbSession,
    current_user: CurrentUser,
) -> list[ApartmentResponse]:

    print(
        "========== APARTMENTS DEBUG =========="
    )

    print(
        "DB:",
        db.execute(
            text(
                "SELECT current_database(), current_schema(), current_user"
            )
        ).fetchone(),
    )

    print(
        "TABLE:",
        db.execute(
            text(
                "SELECT to_regclass('public.apartments')"
            )
        ).fetchone(),
    )

    print(
        "======================================"
    )

    return ApartmentService.get_all(
        db,
        current_user.id,
    )


# =====================================================
# BUSCAR POR ID
# =====================================================

@router.get(
    "/{apartment_id}",
    response_model=ApartmentResponse,
)
def get_apartment(
    apartment_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> ApartmentResponse:
    try:
        return ApartmentService.get_by_id(
            db,
            apartment_id,
            current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


# =====================================================
# ATUALIZAR
# =====================================================

@router.patch(
    "/{apartment_id}",
    response_model=ApartmentResponse,
)
def update_apartment(
    apartment_id: int,
    apartment_data: ApartmentUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> ApartmentResponse:
    try:
        return ApartmentService.update(
            db,
            apartment_id,
            apartment_data,
            current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


# =====================================================
# EXCLUIR
# =====================================================

@router.delete(
    "/{apartment_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_apartment(
    apartment_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    try:
        ApartmentService.delete(
            db,
            apartment_id,
            current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc