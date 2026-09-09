from datetime import date

from pydantic import BaseModel

from app.schemas.task import TaskResponse


class CalendarDay(BaseModel):
    date: date
    tasks: list[TaskResponse]


class CalendarResponse(BaseModel):
    start_date: date
    end_date: date
    days: list[CalendarDay]