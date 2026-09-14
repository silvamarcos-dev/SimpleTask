from datetime import datetime

from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ApartmentStatus(str, Enum):
    ACTIVE = "ativo"
    INACTIVE = "inativo"
    MAINTENANCE = "manutencao"


# =====================================================
# BASE
# =====================================================

class ApartmentBase(BaseModel):

    title: str = Field(
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    building: str = Field(
        min_length=1,
        max_length=150,
    )

    block: str | None = Field(
        default=None,
        max_length=50,
    )

    apartment: str = Field(
        min_length=1,
        max_length=50,
    )

    status: ApartmentStatus = ApartmentStatus.ACTIVE


# =====================================================
# CRIAÇÃO
# =====================================================

class ApartmentCreate(ApartmentBase):
    pass


# =====================================================
# ATUALIZAÇÃO
# =====================================================

class ApartmentUpdate(BaseModel):

    title: str | None = Field(
        default=None,
        min_length=1,
        max_length=200,
    )

    description: str | None = None

    building: str | None = Field(
        default=None,
        min_length=1,
        max_length=150,
    )

    block: str | None = Field(
        default=None,
        max_length=50,
    )

    apartment: str | None = Field(
        default=None,
        min_length=1,
        max_length=50,
    )

    status: ApartmentStatus | None = None


# =====================================================
# RESPOSTA
# =====================================================

class ApartmentResponse(ApartmentBase):

    id: int
    user_id: int

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )