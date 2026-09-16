from datetime import datetime, timezone

from google.auth.transport.requests import Request
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.google_account import GoogleAccount


settings = get_settings()


GOOGLE_CALENDAR_SCOPES = [
    "https://www.googleapis.com/auth/calendar",
]


class GoogleCalendarService:

    # =====================================================
    # CRIAR FLOW
    # =====================================================

    @staticmethod
    def create_flow(
        *,
        state: str | None = None,
        code_verifier: str | None = None,
    ) -> Flow:

        return Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=GOOGLE_CALENDAR_SCOPES,
            state=state,
            redirect_uri=settings.google_redirect_uri,
            code_verifier=code_verifier,
        )

    # =====================================================
    # URL DE AUTORIZAÇÃO
    # =====================================================

    @staticmethod
    def create_authorization_url() -> tuple[str, str, str]:

        flow = GoogleCalendarService.create_flow()

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
    # TROCAR CODE POR TOKENS
    # =====================================================

    @staticmethod
    def exchange_code_for_tokens(
        *,
        code: str,
        state: str,
        code_verifier: str,
    ):

        flow = GoogleCalendarService.create_flow(
            state=state,
            code_verifier=code_verifier,
        )

        flow.fetch_token(
            code=code,
        )

        return flow.credentials

    # =====================================================
    # SALVAR CONTA GOOGLE
    # =====================================================

    @staticmethod
    def save_google_account(
        db: Session,
        user_id: int,
        credentials,
    ) -> GoogleAccount:

        if credentials.id_token is None:
            raise ValueError(
                "O Google não retornou um ID token."
            )

        google_user = id_token.verify_oauth2_token(
            credentials.id_token,
            Request(),
            settings.google_client_id,
        )

        google_id = google_user.get("sub")

        if not google_id:
            raise ValueError(
                "O Google não retornou o identificador da conta."
            )

        statement = select(GoogleAccount).where(
            GoogleAccount.user_id == user_id
        )

        google_account = db.scalar(statement)

        if google_account is None:
            google_account = GoogleAccount(
                user_id=user_id,
                google_id=google_id,
            )

            db.add(google_account)

        elif google_account.google_id != google_id:
            google_account.google_id = google_id

        google_account.access_token = credentials.token

        if credentials.refresh_token:
            google_account.refresh_token = credentials.refresh_token

        if credentials.expiry:
            google_account.token_expires_at = credentials.expiry

        db.commit()
        db.refresh(google_account)

        return google_account