from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field

from app.models.marketing_post import (
    MarketingContentType,
    MarketingPlatform,
    MarketingPostStatus,
)


class MarketingPostBase(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    scheduled_date: date

    scheduled_time: time | None = None

    platform: MarketingPlatform

    content_type: MarketingContentType

    status: MarketingPostStatus = (
        MarketingPostStatus.PLANNED
    )


class MarketingPostCreate(
    MarketingPostBase
):
    pass


class MarketingPostUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    scheduled_date: date | None = None

    scheduled_time: time | None = None

    platform: MarketingPlatform | None = None

    content_type: MarketingContentType | None = None

    status: MarketingPostStatus | None = None


class MarketingPostResponse(
    MarketingPostBase
):
    id: int

    company_id: int

    created_by_id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )