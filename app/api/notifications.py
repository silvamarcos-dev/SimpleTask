from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.services.notification_service import NotificationService


router = APIRouter(
    prefix="/notifications",
    tags=["Notificações"],
)


DbSession = Annotated[Session, Depends(get_db)]
CurrentUser = Annotated[User, Depends(get_current_user)]


@router.post(
    "/tomorrow",
)
def send_tomorrow_reminder(
    db: DbSession,
    current_user: CurrentUser,
) -> dict[str, str]:
    message = NotificationService.send_tomorrow_reminder(
        db,
        current_user,
    )

    if message is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Não existem tarefas pendentes para amanhã.",
        )

    return {
        "message": "Lembrete processado com sucesso.",
    }