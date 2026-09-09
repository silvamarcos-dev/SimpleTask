from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.calendar import CalendarDay, CalendarResponse
from app.services.calendar_service import CalendarService


router = APIRouter(
    prefix="/calendar",
    tags=["Calendário"],
)


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


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