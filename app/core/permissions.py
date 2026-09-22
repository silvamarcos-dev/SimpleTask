from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.permission import Permission
from app.models.user import User


def require_permission(permission_name: str) -> Callable:
    def permission_dependency(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        if current_user.role_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente.",
            )

        has_permission = db.scalar(
            select(Permission.id)
            .join(Permission.roles)
            .where(
                Permission.name == permission_name,
                Permission.roles.any(id=current_user.role_id),
            )
        )

        if has_permission is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissão insuficiente.",
            )

        return current_user

    return permission_dependency