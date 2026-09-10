from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.models.maintenance import Maintenance


class MaintenanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_by_user(
        self,
        user_id: int,
    ) -> list[Maintenance]:
        statement = (
            select(Maintenance)
            .where(Maintenance.user_id == user_id)
            .order_by(
                Maintenance.scheduled_date.asc(),
                Maintenance.created_at.desc(),
            )
        )

        return list(self.db.scalars(statement).all())

    def get_by_id(
        self,
        maintenance_id: int,
        user_id: int,
    ) -> Maintenance | None:
        statement = select(Maintenance).where(
            Maintenance.id == maintenance_id,
            Maintenance.user_id == user_id,
        )

        return self.db.scalar(statement)

    def create(
        self,
        maintenance: Maintenance,
    ) -> Maintenance:
        self.db.add(maintenance)
        self.db.commit()
        self.db.refresh(maintenance)

        return maintenance

    def update(
        self,
        maintenance: Maintenance,
    ) -> Maintenance:
        self.db.commit()
        self.db.refresh(maintenance)

        return maintenance

    def delete(
        self,
        maintenance: Maintenance,
    ) -> None:
        statement = delete(Maintenance).where(
            Maintenance.id == maintenance.id,
            Maintenance.user_id == maintenance.user_id,
        )

        self.db.execute(statement)
        self.db.commit()