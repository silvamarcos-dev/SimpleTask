from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.maintenance import (
    MaintenancePriority,
    MaintenanceStatus,
    ProviderType,
)


class MaintenanceBase(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )
    description: str | None = None

    building: str | None = Field(
        default=None,
        max_length=150,
    )
    block: str | None = Field(
        default=None,
        max_length=50,
    )
    apartment: str | None = Field(
        default=None,
        max_length=50,
    )

    category: str | None = Field(
        default=None,
        max_length=100,
    )

    priority: MaintenancePriority = (
        MaintenancePriority.MEDIUM
    )

    status: MaintenanceStatus = (
        MaintenanceStatus.PENDING
    )

    provider_type: ProviderType | None = None

    provider_name: str | None = Field(
        default=None,
        max_length=150,
    )
    provider_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    scheduled_date: date | None = None

    notes: str | None = None


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )
    description: str | None = None

    building: str | None = Field(
        default=None,
        max_length=150,
    )
    block: str | None = Field(
        default=None,
        max_length=50,
    )
    apartment: str | None = Field(
        default=None,
        max_length=50,
    )

    category: str | None = Field(
        default=None,
        max_length=100,
    )

    priority: MaintenancePriority | None = None
    status: MaintenanceStatus | None = None
    provider_type: ProviderType | None = None

    provider_name: str | None = Field(
        default=None,
        max_length=150,
    )
    provider_phone: str | None = Field(
        default=None,
        max_length=30,
    )

    scheduled_date: date | None = None

    notes: str | None = None


class MaintenanceResponse(MaintenanceBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )