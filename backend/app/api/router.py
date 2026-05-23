from fastapi import APIRouter

from app.api.routes import health
from app.modules.analytics.api import router as analytics_router
from app.modules.audit.api import router as audit_router
from app.modules.b2b.api import router as b2b_router
from app.modules.crm.api import router as crm_router
from app.modules.identity.admin_api import router as admin_router
from app.modules.identity.api import router as auth_router
from app.modules.identity.settings_api import router as settings_router
from app.modules.notifications.api import router as notifications_router

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(audit_router)
api_router.include_router(settings_router)
api_router.include_router(crm_router)
api_router.include_router(b2b_router)
api_router.include_router(analytics_router)
api_router.include_router(notifications_router)
