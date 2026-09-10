from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance
from app.repositories.maintenance import MaintenanceRepository
from app.schemas.maintenance import (
    MaintenanceCreate,
    MaintenanceUpdate,
)


class MaintenanceService:
    def __init__(self, db: Session):
        self.repository = MaintenanceRepository(db)

    def get_all(
        self,
        user_id: int,
    ) -> list[Maintenance]:
        return self.repository.get_all_by_user(user_id)

    def get_by_id(
        self,
        maintenance_id: int,
        user_id: int,
    ) -> Maintenance:
        maintenance = self.repository.get_by_id(
            maintenance_id=maintenance_id,
            user_id=user_id,
        )

        if maintenance is None:
            raise ValueError("Manutenção não encontrada.")

        return maintenance

    def create(
        self,
        data: MaintenanceCreate,
        user_id: int,
    ) -> Maintenance:
        maintenance = Maintenance(
            **data.model_dump(),
            user_id=user_id,
        )

        return self.repository.create(maintenance)

    def update(
        self,
        maintenance_id: int,
        data: MaintenanceUpdate,
        user_id: int,
    ) -> Maintenance:
        maintenance = self.get_by_id(
            maintenance_id=maintenance_id,
            user_id=user_id,
        )

        update_data = data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(maintenance, field, value)

        return self.repository.update(maintenance)

    def delete(
        self,
        maintenance_id: int,
        user_id: int,
    ) -> None:
        maintenance = self.get_by_id(
            maintenance_id=maintenance_id,
            user_id=user_id,
        )

        self.repository.delete(maintenance)