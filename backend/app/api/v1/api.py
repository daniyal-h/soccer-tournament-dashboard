from fastapi import APIRouter, Depends

from app.api.v1.routers import (
    admin,
    health,
    matches,
    player_stats,
    search,
    tournaments,
)
from app.core.auth import verify_admin_token

api_router = APIRouter()

api_router.include_router(
    admin.router, prefix="/admin", tags=["admin"], dependencies=[Depends(verify_admin_token)]
)
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(matches.router, prefix="/matches", tags=["matches"])
api_router.include_router(player_stats.router, prefix="/player_stats", tags=["player_stats"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(tournaments.router, prefix="/tournaments", tags=["tournaments"])
