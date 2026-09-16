from fastapi import HTTPException, status
from google.auth.transport.requests import Request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import create_access_token, verify_password
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.user_service import UserService


settings = get_settings()


GOOGLE_SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
]


class AuthService:

    # =====================================================
    # LOGIN TRADICIONAL
    # =====================================================

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

        if user.password_hash is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Esta conta utiliza login com Google.",
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

    # =====================================================
    # CONFIGURAÇÃO DO GOOGLE
    # =====================================================

    @staticmethod
    def _create_google_flow(
        *,
        state: str | None = None,
        code_verifier: str | None = None,
    ) -> Flow:
        return Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": (
                        "https://accounts.google.com/o/oauth2/auth"
                    ),
                    "token_uri": (
                        "https://oauth2.googleapis.com/token"
                    ),
                }
            },
            scopes=GOOGLE_SCOPES,
            state=state,
            redirect_uri=settings.google_redirect_uri,
            code_verifier=code_verifier,
        )

    # =====================================================
    # GERAR URL DO GOOGLE
    # =====================================================

    @staticmethod
    def create_google_authorization_url() -> tuple[str, str, str]:
        flow = AuthService._create_google_flow()

        authorization_url, state = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent",
        )

        if flow.code_verifier is None:
            raise RuntimeError(
                "O Google OAuth não gerou um code_verifier."
            )

        return (
            authorization_url,
            state,
            flow.code_verifier,
        )

    # =====================================================
    # LOGIN COM GOOGLE
    # =====================================================

    @staticmethod
    def login_with_google(
        db: Session,
        code: str,
        state: str,
        code_verifier: str,
    ) -> str:
        flow = AuthService._create_google_flow(
            state=state,
            code_verifier=code_verifier,
        )

        flow.fetch_token(
            code=code,
        )

        credentials = flow.credentials

        if credentials.id_token is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="O Google não retornou um ID token.",
            )

        google_user = id_token.verify_oauth2_token(
            credentials.id_token,
            Request(),
            settings.google_client_id,
        )

        google_id = google_user.get("sub")
        email = google_user.get("email")
        name = google_user.get("name")

        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Dados do usuário Google incompletos.",
            )

        # =================================================
        # PROCURA PELO GOOGLE ID
        # =================================================

        statement = select(User).where(
            User.google_id == google_id,
        )

        user = db.scalar(statement)

        # =================================================
        # SE NÃO ENCONTROU, PROCURA PELO E-MAIL
        # =================================================

        if user is None:
            user = UserService.get_by_email(
                db,
                email,
            )

        # =================================================
        # USUÁRIO NOVO
        # =================================================

        if user is None:
            user = User(
                name=name or email.split("@")[0],
                email=email,
                password_hash=None,
                google_id=google_id,
            )

            db.add(user)
            db.commit()
            db.refresh(user)

        # =================================================
        # USUÁRIO EXISTENTE
        # =================================================

        elif user.google_id != google_id:
            user.google_id = google_id

            db.add(user)
            db.commit()
            db.refresh(user)

        # =================================================
        # JWT DO SIMPLE TASK
        # =================================================

        return create_access_token(
            subject=str(user.id),
        )

