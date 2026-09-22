from contextlib import asynccontextmanager

import app.models

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.api import (
    apartments,
    auth,
    calendar,
    dashboard,
    maintenance,
    departments,
    notifications,
    tasks,
    marketing_post,
)
from app.core.config import get_settings
from app.core.permissions import require_permission
from app.models.user import User


settings = get_settings()


# =====================================================
# LIFESPAN
# =====================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


# =====================================================
# APLICAÇÃO
# =====================================================

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
)


# =====================================================
# SESSÃO
# =====================================================

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.jwt_secret_key,
)


# =====================================================
# CORS
# =====================================================

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


# =====================================================
# ROTAS
# =====================================================

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(dashboard.router)
app.include_router(calendar.router)
app.include_router(notifications.router)
app.include_router(maintenance.router)
app.include_router(apartments.router)
app.include_router(departments.router)
app.include_router(marketing_post.router)

# =====================================================
# SISTEMA
# =====================================================

@app.get("/", tags=["Sistema"])
def root() -> dict[str, str]:
    return {
        "message": "Simple Task API",
        "version": settings.app_version,
        "status": "online",
    }


@app.get("/health", tags=["Sistema"])
def health_check() -> dict[str, str]:
    return {
        "status": "healthy",
    }


# =====================================================
# TESTE DE PERMISSÃO / RBAC
# =====================================================

@app.get("/test/permission", tags=["Sistema"])
def test_permission(
    current_user: User = Depends(
        require_permission("users.create")
    ),
) -> dict[str, int | str]:
    return {
        "message": "Permissão concedida.",
        "user_id": current_user.id,
        "role_id": current_user.role_id,
    }