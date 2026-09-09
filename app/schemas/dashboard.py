from datetime import date

from pydantic import BaseModel


class UrgencySummary(BaseModel):
    baixa: int
    media: int
    alta: int


class DashboardSummary(BaseModel):
    date: date
    total: int
    completed: int
    pending: int
    by_urgency: UrgencySummary
    completion_percentage: float