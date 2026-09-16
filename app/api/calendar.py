from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from starlette.responses import RedirectResponse

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.calendar import CalendarDay, CalendarResponse
from app.services.calendar_service import CalendarService
from app.services.google_calendar_service import GoogleCalendarService


router = APIRouter(
    prefix="/calendar",
    tags=["Calendário"],
)


DbSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


@router.get(
    "",
    response_model=CalendarResponse,
)
def get_calendar(
    db: DbSession,
    current_user: CurrentUser,
    start_date: Annotated[date, Query()],
    end_date: Annotated[date, Query()],
) -> CalendarResponse:

    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="A data final não pode ser anterior à data inicial.",
        )

    calendar = CalendarService.get_tasks_by_period(
        db,
        current_user,
        start_date,
        end_date,
    )

    days = [
        CalendarDay(
            date=calendar_date,
            tasks=tasks,
        )
        for calendar_date, tasks in calendar.items()
    ]

    return CalendarResponse(
        start_date=start_date,
        end_date=end_date,
        days=days,
    )


# =====================================================
# GOOGLE CALENDAR
# =====================================================

@router.get(
    "/google/connect",
)
def google_calendar_connect(
    request: Request,
    current_user: CurrentUser,
) -> RedirectResponse:

    (
        authorization_url,
        state,
        code_verifier,
    ) = GoogleCalendarService.create_authorization_url()

    request.session["google_calendar_user_id"] = current_user.id
    request.session["google_calendar_oauth_state"] = state
    request.session["google_calendar_code_verifier"] = code_verifier

    return RedirectResponse(
        url=authorization_url,
    )

@router.get(
    "/google/callback",
)
def google_calendar_callback(
    request: Request,
    code: Annotated[str, Query()],
    state: Annotated[str, Query()],
    db: DbSession,
) -> dict[str, str]:

    session_state = request.session.pop(
        "google_calendar_oauth_state",
        None,
    )

    code_verifier = request.session.pop(
        "google_calendar_code_verifier",
        None,
    )

    user_id = request.session.pop(
        "google_calendar_user_id",
        None,
    )

    if session_state != state:
        raise HTTPException(
            status_code=400,
            detail="Estado OAuth inválido.",
        )

    if code_verifier is None:
        raise HTTPException(
            status_code=400,
            detail="Code verifier OAuth ausente.",
        )

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Usuário não identificado.",
        )

    # =====================================================
    # TROCA O CODE PELOS TOKENS DO GOOGLE
    # =====================================================

    tokens = GoogleCalendarService.exchange_code_for_tokens(
        code=code,
        state=state,
        code_verifier=code_verifier,
    )

    return {
        "status": "connected",
        "message": "Google Calendar conectado com sucesso.",
    }