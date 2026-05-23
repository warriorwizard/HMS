from fastapi import APIRouter

from app.api.routes import health
from app.modules.analytics.api import router as analytics_router
from app.modules.ai_intelligence.api import router as ai_router
from app.modules.audit.api import router as audit_router
from app.modules.b2b.api import router as b2b_router
from app.modules.command_center.api import router as command_center_router
from app.modules.copilot.api import router as copilot_router
from app.modules.crm.api import router as crm_router
from app.modules.diagnostic_workflow.api import router as workflow_router
from app.modules.patients.api import router as patients_router
from app.modules.identity.admin_api import router as admin_router
from app.modules.identity.api import router as auth_router
from app.modules.identity.settings_api import router as settings_router
from app.modules.lims.api import router as lims_router
from app.modules.notifications.api import router as notifications_router
from app.modules.pacs.api import router as pacs_router
from app.modules.billing.api import router as billing_router
from app.modules.reports.api import router as reports_router
from app.modules.ris.api import router as ris_router

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(audit_router)
api_router.include_router(settings_router)
api_router.include_router(crm_router)
api_router.include_router(b2b_router)
api_router.include_router(patients_router)
api_router.include_router(billing_router)
api_router.include_router(workflow_router)
api_router.include_router(reports_router)
api_router.include_router(lims_router)
api_router.include_router(ris_router)
api_router.include_router(pacs_router)
api_router.include_router(ai_router)
api_router.include_router(command_center_router)
api_router.include_router(copilot_router)
api_router.include_router(analytics_router)
api_router.include_router(notifications_router)
