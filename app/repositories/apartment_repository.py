from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.apartment import Apartment


class ApartmentRepository:

    @staticmethod
    def create(
        db: Session,
        apartment: Apartment,
    ) -> Apartment:

        db.add(apartment)
        db.commit()
        db.refresh(apartment)

        return apartment

    @staticmethod
    def get_all(
        db: Session,
        user_id: int,
    ) -> list[Apartment]:

        result = db.execute(
            select(Apartment)
            .where(Apartment.user_id == user_id)
            .order_by(Apartment.id.desc())
        )

        return list(result.scalars().all())

    @staticmethod
    def get_by_id(
        db: Session,
        apartment_id: int,
        user_id: int,
    ) -> Apartment | None:

        result = db.execute(
            select(Apartment)
            .where(
                Apartment.id == apartment_id,
                Apartment.user_id == user_id,
            )
        )

        return result.scalar_one_or_none()

    @staticmethod
    def update(
        db: Session,
        apartment: Apartment,
    ) -> Apartment:

        db.commit()
        db.refresh(apartment)

        return apartment

    @staticmethod
    def delete(
        db: Session,
        apartment: Apartment,
    ) -> None:

        db.delete(apartment)
        db.commit()