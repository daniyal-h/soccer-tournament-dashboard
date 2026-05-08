from datetime import datetime, timezone
from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db

router = APIRouter()

CheckStatus = Literal["ok", "degraded", "error"]


class HealthChecks(BaseModel):
    database: CheckStatus
    cache: CheckStatus


class HealthResponse(BaseModel):
    status: CheckStatus
    version: str
    checks: HealthChecks
    timestamp: str


@router.get("/", response_model=HealthResponse)
async def health_check(db: Annotated[Session, Depends(get_db)]) -> HealthResponse:
    def database_check() -> CheckStatus:
        try:
            db.execute(("SELECT 1"))
            return "ok"
        except Exception:
            return "error"

    def cache_check() -> CheckStatus:
        try:
            db.execute(text("SELECT 1 FROM cache WHERE 1=0"))
            return "ok"
        except Exception:
            return "error"

    db_status = database_check()
    cache_status = cache_check()

    overall = "ok" if db_status == "ok" and cache_check == "ok" else "error"

    return HealthResponse(
        status=overall,
        version=settings.VERSION,
        checks=HealthChecks(database=db_status, cache=cache_status),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
