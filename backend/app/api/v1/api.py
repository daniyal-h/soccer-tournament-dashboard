from fastapi import APIRouter, Depends

from app.api.v1.routers import (
    admin,
    health,
    matches,
    tournaments,
)
from app.core.auth import verify_admin_token

api_router = APIRouter()

api_router.include_router(
    admin.router, prefix="/admin", tags=["admin"], dependencies=[Depends(verify_admin_token)]
)
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(tournaments.router, prefix="/tournaments", tags=["tournaments"])
