from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    auth,
    calendar,
    dashboard,
    maintenance,
    notifications,
    tasks,
)
from app.core.config import get_settings
from app.jobs.scheduler import start_scheduler, stop_scheduler


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_scheduler()

    yield

    stop_scheduler()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://simple-task-gold.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(calendar.router)
app.include_router(notifications.router)
app.include_router(maintenance.router)

@app.get(
    "/",
    tags=["Sistema"],
)
def root() -> dict[str, str]:
    return {
        "message": "Simple Task API",
        "version": settings.app_version,
        "status": "online",
    }


@app.get(
    "/health",
    tags=["Sistema"],
)
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
    }