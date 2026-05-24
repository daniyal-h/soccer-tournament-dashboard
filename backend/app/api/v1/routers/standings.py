from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Request
from sqlalchemy.orm import Session

from app.api.v1.services import standings as standings_service
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.standings import StandingResponse

router = APIRouter()


@router.get("/{tournament_id}", response_model=dict[str, list[StandingResponse]])
@limiter.limit("60/minute")
def get_standings(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: Annotated[int, Path(gt=0)],
    group: Annotated[
        str | None,
        Query(pattern="^[A-L]$", max_length=1),
    ] = None,
):
    return standings_service.get_standings(db, tournament_id, group)
