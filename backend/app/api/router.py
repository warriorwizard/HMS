from fastapi import APIRouter

from app.api.routes import health
from app.modules.crm.api import router as crm_router
from app.modules.identity.admin_api import router as admin_router
from app.modules.identity.api import router as auth_router

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(crm_router)
