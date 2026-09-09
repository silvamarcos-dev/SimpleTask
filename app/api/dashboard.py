from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import DashboardService


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.get(
    "/today",
    response_model=DashboardSummary,
)
def get_today_dashboard(
    db: DbSession,
    current_user: CurrentUser,
    target_date: Annotated[date | None, Query()] = None,
) -> DashboardSummary:
    return DashboardService.get_today_summary(
        db,
        current_user,
        target_date,
    )