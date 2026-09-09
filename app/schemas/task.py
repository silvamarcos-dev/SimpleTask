from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.task import TaskStatus, UrgencyLevel


class TaskBase(BaseModel):
    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    urgency: UrgencyLevel = UrgencyLevel.MEDIUM

    scheduled_date: date

    scheduled_time: time | None = None

    # =====================================================
    # LOCALIZAÇÃO
    # =====================================================

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

    # =====================================================
    # RECORRÊNCIA
    # =====================================================

    is_recurring: bool = False

    recurrence_interval_months: int | None = Field(
        default=None,
        ge=1,
        le=120,
    )

    @model_validator(mode="after")
    def validate_recurrence(self):
        if self.is_recurring:
            if self.recurrence_interval_months is None:
                raise ValueError(
                    "Uma tarefa recorrente precisa informar o intervalo em meses."
                )
        else:
            self.recurrence_interval_months = None

        return self


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = Field(
        default=None,
        max_length=5000,
    )

    urgency: UrgencyLevel | None = None

    status: TaskStatus | None = None

    scheduled_date: date | None = None

    scheduled_time: time | None = None

    # =====================================================
    # LOCALIZAÇÃO
    # =====================================================

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

    # =====================================================
    # RECORRÊNCIA
    # =====================================================

    is_recurring: bool | None = None

    recurrence_interval_months: int | None = Field(
        default=None,
        ge=1,
        le=120,
    )


class TaskResponse(TaskBase):
    id: int

    status: TaskStatus

    completed_at: datetime | None

    next_recurrence_date: date | None

    user_id: int

    created_at: datetime

    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )