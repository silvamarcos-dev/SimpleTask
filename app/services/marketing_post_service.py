from __future__ import annotations

from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.marketing_post import MarketingPost
from app.models.user import User
from app.schemas.marketing_post import (
    MarketingPostCreate,
    MarketingPostUpdate,
)


class MarketingPostService:

    @staticmethod
    def _ensure_company(
        user: User,
    ) -> int:
        if user.company_id is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    "Usuário não está associado "
                    "a uma empresa."
                ),
            )

        return user.company_id

    @staticmethod
    def create(
        db: Session,
        user: User,
        post_data: MarketingPostCreate,
    ) -> MarketingPost:

        company_id = (
            MarketingPostService._ensure_company(
                user
            )
        )

        post = MarketingPost(
            title=post_data.title.strip(),
            description=post_data.description,
            scheduled_date=post_data.scheduled_date,
            scheduled_time=post_data.scheduled_time,
            platform=post_data.platform,
            content_type=post_data.content_type,
            status=post_data.status,
            company_id=company_id,
            created_by_id=user.id,
        )

        db.add(post)
        db.commit()
        db.refresh(post)

        return post

    @staticmethod
    def get_by_id(
        db: Session,
        user: User,
        post_id: int,
    ) -> MarketingPost | None:

        company_id = (
            MarketingPostService._ensure_company(
                user
            )
        )

        statement = select(
            MarketingPost
        ).where(
            MarketingPost.id == post_id,
            MarketingPost.company_id == company_id,
        )

        return db.scalar(statement)

    @staticmethod
    def list(
        db: Session,
        user: User,
        start_date: date | None = None,
        end_date: date | None = None,
    ) -> list[MarketingPost]:

        company_id = (
            MarketingPostService._ensure_company(
                user
            )
        )

        statement = select(
            MarketingPost
        ).where(
            MarketingPost.company_id == company_id,
        )

        if start_date is not None:
            statement = statement.where(
                MarketingPost.scheduled_date
                >= start_date
            )

        if end_date is not None:
            statement = statement.where(
                MarketingPost.scheduled_date
                <= end_date
            )

        statement = statement.order_by(
            MarketingPost.scheduled_date.asc(),
            MarketingPost.scheduled_time.asc(),
            MarketingPost.created_at.asc(),
        )

        return list(
            db.scalars(statement).all()
        )

    @staticmethod
    def update(
        db: Session,
        user: User,
        post: MarketingPost,
        post_data: MarketingPostUpdate,
    ) -> MarketingPost:

        company_id = (
            MarketingPostService._ensure_company(
                user
            )
        )

        if post.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Postagem não encontrada.",
            )

        update_data = post_data.model_dump(
            exclude_unset=True,
        )

        if "title" in update_data:
            update_data["title"] = (
                update_data["title"].strip()
            )

            if not update_data["title"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        "O título da postagem "
                        "não pode estar vazio."
                    ),
                )

        for field, value in update_data.items():
            setattr(
                post,
                field,
                value,
            )

        db.commit()
        db.refresh(post)

        return post

    @staticmethod
    def delete(
        db: Session,
        user: User,
        post: MarketingPost,
    ) -> None:

        company_id = (
            MarketingPostService._ensure_company(
                user
            )
        )

        if post.company_id != company_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Postagem não encontrada.",
            )

        db.delete(post)
        db.commit()