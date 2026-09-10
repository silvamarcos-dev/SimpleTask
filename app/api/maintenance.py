from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.maintenance import Maintenance
from app.models.user import User
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceResponse,
    MaintenanceUpdate,
)
from app.services.maintenance import MaintenanceService


router = APIRouter(
    prefix="/maintenance",
    tags=["Manutenções"],
)


DbSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


@router.post(
    "",
    response_model=MaintenanceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_maintenance(
    maintenance_data: MaintenanceCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> MaintenanceResponse:
    service = MaintenanceService(db)

    return service.create(
        data=maintenance_data,
        user_id=current_user.id,
    )


@router.get(
    "",
    response_model=list[MaintenanceResponse],
)
def list_maintenances(
    db: DbSession,
    current_user: CurrentUser,
) -> list[Maintenance]:
    service = MaintenanceService(db)

    return service.get_all(
        user_id=current_user.id,
    )


@router.get(
    "/{maintenance_id}",
    response_model=MaintenanceResponse,
)
def get_maintenance(
    maintenance_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> MaintenanceResponse:
    service = MaintenanceService(db)

    try:
        return service.get_by_id(
            maintenance_id=maintenance_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.put(
    "/{maintenance_id}",
    response_model=MaintenanceResponse,
)
def update_maintenance(
    maintenance_id: int,
    maintenance_data: MaintenanceUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> MaintenanceResponse:
    service = MaintenanceService(db)

    try:
        return service.update(
            maintenance_id=maintenance_id,
            data=maintenance_data,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.delete(
    "/{maintenance_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_maintenance(
    maintenance_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:
    service = MaintenanceService(db)

    try:
        service.delete(
            maintenance_id=maintenance_id,
            user_id=current_user.id,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc