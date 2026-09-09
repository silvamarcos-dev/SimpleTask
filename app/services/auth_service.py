from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.user_service import UserService


class AuthService:
    @staticmethod
    def register(
        db: Session,
        user_data: UserCreate,
    ) -> User:
        existing_user = UserService.get_by_email(
            db,
            user_data.email,
        )

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Já existe um usuário com este e-mail.",
            )

        return UserService.create(
            db,
            user_data,
        )

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ) -> str:
        user = UserService.get_by_email(
            db,
            email,
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not verify_password(
            password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-mail ou senha inválidos.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return create_access_token(
            subject=str(user.id),
        )