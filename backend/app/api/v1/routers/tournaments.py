from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Request
from sqlalchemy.orm import Session

from app.api.v1.services import matches as matches_service
from app.api.v1.services import standings as standings_service
from app.api.v1.services import teams as teams_service
from app.api.v1.services import tournament_teams as tournament_teams_service
from app.api.v1.services import tournaments as tournaments_service
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.matches import MatchResponse
from app.schemas.standings import StandingResponse
from app.schemas.tournament_teams import TournamentTeamResponse
from app.schemas.tournaments import TournamentResponse

router = APIRouter()


@router.get("", response_model=list[TournamentResponse])
def get_tournaments(db: Annotated[Session, Depends(get_db)]):
    return tournaments_service.get_tournaments(db)


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


@router.get("/{tournament_id}/matches", response_model=list[MatchResponse])
@limiter.limit("60/minute")
def get_matches(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: Annotated[int, Path(gt=0)],
):
    return matches_service.get_matches(db, tournament_id)


@router.get("/{tournament_id}/teams", response_model=list[TournamentTeamResponse])
@limiter.limit("60/minute")
def get_teams(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: Annotated[int, Path(gt=0)],
):
    """
    Return all ranked teams in the tournament.
    Teams are ranked based on the state of the tournament (either by final rank or stage reached).
    """

    return tournament_teams_service.get_ranked_tournament_teams(db, tournament_id)


@router.get("{tournament_id}/teams/{team_id}/profile")
@limiter.limit("60/minute")
async def get_team_profile(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: Annotated[int, Path(gt=0)],
    team_id: Annotated[int, Path(gt=0)],
) -> dict:
    return teams_service.get_profile(db, tournament_id, team_id)


@router.get("{tournament_id}/teams/{team_id}/matches")
@limiter.limit("60/minute")
async def get_team_matches(
    team_id: int, tournament_id: int | None = None, status: str | None = None, limit: int = 20
) -> dict:
    return {"message": "not yet implemented"}


@router.get("{tournament_id}/teams/{team_id}/squad")
@limiter.limit("60/minute")
async def get_team_squad(team_id: int, tournament_id: int) -> dict:
    return {"message": "not yet implemented"}
