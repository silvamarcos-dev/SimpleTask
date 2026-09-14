from sqlalchemy.orm import Session

from app.models.apartment import Apartment
from app.repositories.apartment_repository import ApartmentRepository
from app.schemas.apartment import ApartmentCreate, ApartmentUpdate


class ApartmentService:

    @staticmethod
    def create(
        db: Session,
        apartment_data: ApartmentCreate,
        user_id: int,
    ) -> Apartment:

        apartment = Apartment(
            title=apartment_data.title,
            description=apartment_data.description,
            building=apartment_data.building,
            block=apartment_data.block,
            apartment=apartment_data.apartment,
            status=apartment_data.status,
            user_id=user_id,
        )

        return ApartmentRepository.create(
            db=db,
            apartment=apartment,
        )

    @staticmethod
    def get_all(
        db: Session,
        user_id: int,
    ) -> list[Apartment]:

        return ApartmentRepository.get_all(
            db=db,
            user_id=user_id,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        apartment_id: int,
        user_id: int,
    ) -> Apartment:

        apartment = ApartmentRepository.get_by_id(
            db=db,
            apartment_id=apartment_id,
            user_id=user_id,
        )

        if apartment is None:
            raise ValueError("Apartamento não encontrado.")

        return apartment

    @staticmethod
    def update(
        db: Session,
        apartment_id: int,
        apartment_data: ApartmentUpdate,
        user_id: int,
    ) -> Apartment:

        apartment = ApartmentService.get_by_id(
            db=db,
            apartment_id=apartment_id,
            user_id=user_id,
        )

        update_data = apartment_data.model_dump(
            exclude_unset=True,
        )

        for field, value in update_data.items():
            setattr(apartment, field, value)

        return ApartmentRepository.update(
            db=db,
            apartment=apartment,
        )

    @staticmethod
    def delete(
        db: Session,
        apartment_id: int,
        user_id: int,
    ) -> None:

        apartment = ApartmentService.get_by_id(
            db=db,
            apartment_id=apartment_id,
            user_id=user_id,
        )

        ApartmentRepository.delete(
            db=db,
            apartment=apartment,
        )