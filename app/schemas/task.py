from datetime import date, datetime, time

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.task import (
    RecurrenceType,
    TaskStatus,
    UrgencyLevel,
)


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

    recurrence_type: RecurrenceType = RecurrenceType.NONE

    recurrence_interval: int | None = Field(
        default=None,
        ge=1,
        le=120,
    )

    @model_validator(mode="after")
    def validate_recurrence(self):
        # =================================================
        # NÃO RECORRENTE
        # =================================================

        if not self.is_recurring:
            self.recurrence_type = RecurrenceType.NONE
            self.recurrence_interval = None

            return self

        # =================================================
        # RECORRENTE SEM TIPO
        # =================================================

        if self.recurrence_type == RecurrenceType.NONE:
            raise ValueError(
                "Uma tarefa recorrente precisa informar "
                "um tipo de recorrência."
            )

        # =================================================
        # RECORRENTE SEM INTERVALO
        # =================================================

        if self.recurrence_interval is None:
            raise ValueError(
                "Uma tarefa recorrente precisa informar "
                "o intervalo."
            )

        # =================================================
        # INTERVALO INVÁLIDO
        # =================================================

        if self.recurrence_interval < 1:
            raise ValueError(
                "O intervalo de recorrência deve ser "
                "maior que zero."
            )

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

    recurrence_type: RecurrenceType | None = None

    recurrence_interval: int | None = Field(
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