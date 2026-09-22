from datetime import date
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.user import User
from app.schemas.marketing_post import (
    MarketingPostCreate,
    MarketingPostResponse,
    MarketingPostUpdate,
)
from app.services.marketing_post_service import (
    MarketingPostService,
)


router = APIRouter(
    prefix="/marketing/posts",
    tags=["Marketing"],
)


DbSession = Annotated[
    Session,
    Depends(get_db),
]

CurrentUser = Annotated[
    User,
    Depends(get_current_user),
]


# =========================================================
# CREATE
# =========================================================

@router.post(
    "",
    response_model=MarketingPostResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_marketing_post(
    post_data: MarketingPostCreate,
    db: DbSession,
    current_user: CurrentUser,
) -> MarketingPostResponse:

    return MarketingPostService.create(
        db=db,
        user=current_user,
        post_data=post_data,
    )


# =========================================================
# LIST
# =========================================================

@router.get(
    "",
    response_model=list[MarketingPostResponse],
)
def list_marketing_posts(
    db: DbSession,
    current_user: CurrentUser,
    start_date: Annotated[
        date | None,
        Query(),
    ] = None,
    end_date: Annotated[
        date | None,
        Query(),
    ] = None,
) -> list[MarketingPostResponse]:

    if (
        start_date is not None
        and end_date is not None
        and start_date > end_date
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "start_date não pode ser maior "
                "que end_date."
            ),
        )

    return MarketingPostService.list(
        db=db,
        user=current_user,
        start_date=start_date,
        end_date=end_date,
    )


# =========================================================
# GET BY ID
# =========================================================

@router.get(
    "/{post_id}",
    response_model=MarketingPostResponse,
)
def get_marketing_post(
    post_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> MarketingPostResponse:

    post = MarketingPostService.get_by_id(
        db=db,
        user=current_user,
        post_id=post_id,
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Postagem não encontrada.",
        )

    return post


# =========================================================
# UPDATE
# =========================================================

@router.patch(
    "/{post_id}",
    response_model=MarketingPostResponse,
)
def update_marketing_post(
    post_id: int,
    post_data: MarketingPostUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> MarketingPostResponse:

    post = MarketingPostService.get_by_id(
        db=db,
        user=current_user,
        post_id=post_id,
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Postagem não encontrada.",
        )

    return MarketingPostService.update(
        db=db,
        user=current_user,
        post=post,
        post_data=post_data,
    )


# =========================================================
# DELETE
# =========================================================

@router.delete(
    "/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_marketing_post(
    post_id: int,
    db: DbSession,
    current_user: CurrentUser,
) -> None:

    post = MarketingPostService.get_by_id(
        db=db,
        user=current_user,
        post_id=post_id,
    )

    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Postagem não encontrada.",
        )

    MarketingPostService.delete(
        db=db,
        user=current_user,
        post=post,
    )