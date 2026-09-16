from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    Request,
    status,
)
from fastapi.responses import RedirectResponse
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.auth import TokenResponse
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService


router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"],
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
# CADASTRO
# =====================================================

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(
    user_data: UserCreate,
    db: DbSession,
) -> UserResponse:

    return AuthService.register(
        db,
        user_data,
    )


# =====================================================
# LOGIN TRADICIONAL
# =====================================================

@router.post(
    "/login",
    response_model=TokenResponse,
)
def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: DbSession,
) -> TokenResponse:

    access_token = AuthService.login(
        db,
        form_data.username,
        form_data.password,
    )

    return TokenResponse(
        access_token=access_token,
    )


# =====================================================
# LOGIN COM GOOGLE
# =====================================================

@router.get(
    "/google",
)
def google_login(
    request: Request,
) -> RedirectResponse:

    (
        authorization_url,
        state,
        code_verifier,
    ) = AuthService.create_google_authorization_url()

    request.session["google_oauth_state"] = state
    request.session["google_code_verifier"] = code_verifier

    return RedirectResponse(
        url=authorization_url,
    )


@router.get(
    "/google/callback",
)
def google_callback(
    request: Request,
    code: Annotated[str, Query()],
    state: Annotated[str, Query()],
    db: DbSession,
) -> RedirectResponse:

    session_state = request.session.pop(
        "google_oauth_state",
        None,
    )

    code_verifier = request.session.pop(
        "google_code_verifier",
        None,
    )

    # =====================================================
    # VALIDAR STATE
    # =====================================================

    if session_state != state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estado OAuth inválido.",
        )

    # =====================================================
    # VALIDAR CODE VERIFIER
    # =====================================================

    if code_verifier is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Code verifier OAuth ausente.",
        )

    # =====================================================
    # AUTENTICAR COM GOOGLE
    # =====================================================

    access_token = AuthService.login_with_google(
        db=db,
        code=code,
        state=state,
        code_verifier=code_verifier,
    )

    # =====================================================
    # REDIRECIONAR PARA O FRONTEND
    # =====================================================

    frontend_url = "http://localhost:5173"

    return RedirectResponse(
        url=(
            f"{frontend_url}"
            f"/auth/google/callback"
            f"#access_token={access_token}"
        )
    )


# =====================================================
# USUÁRIO ATUAL
# =====================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: CurrentUser,
) -> UserResponse:

    return current_user