from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Request
from sqlalchemy.orm import Session

from app.api.v1.services import matches as matches_service
from app.api.v1.services import standings as standings_service
from app.api.v1.services import tournaments as tournaments_service
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.matches import MatchesResponse
from app.schemas.standings import StandingResponse
from app.schemas.tournaments import TournamentResponse

router = APIRouter()


@router.get("/", response_model=list[TournamentResponse])
def get_tournaments(db: Annotated[Session, Depends(get_db)]):
    return tournaments_service.get_tournaments(db)


@router.get("/{tournament_id}")
async def get_tournament_details(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.get("/{tournament_id}/standings", response_model=dict[str, list[StandingResponse]])
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


@router.get("/{tournament_id}/matches", response_model=list[MatchesResponse])
@limiter.limit("60/minute")
async def get_matches(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: Annotated[int, Path(gt=0)],
):
    return matches_service.get_matches(db, tournament_id)
