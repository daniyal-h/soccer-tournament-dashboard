from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Request
from sqlalchemy.orm import Session

from app.api.v1.services import matches as matches_service
from app.api.v1.services import refresh_match_events as refresh_match_events_service
from app.api.v1.services import refresh_matches as refresh_matches_service
from app.api.v1.services import refresh_standings as refresh_standings_service
from app.api.v1.services import refresh_team_rankings as refresh_team_rankings_service
from app.api.v1.services import refresh_team_squads as refresh_team_squads_service
from app.constants.external_apis import (
    MATCHES_MARGIN_DAYS,
    STANDINGS_MARGIN_DAYS,
    TEAM_SQUADS_MARGIN_DAYS,
)
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.matches import MatchRefreshRow

router = APIRouter()


@router.post("/tournaments")
def create_tournament() -> dict:
    return {"message": "not yet implemented"}


@router.post("/teams")
def create_team() -> dict:
    return {"message": "not yet implemented"}


@router.post("/players")
def create_player() -> dict:
    return {"message": "not yet implemented"}


@router.post("/matches")
def create_match() -> dict:
    return {"message": "not yet implemented"}


@router.post("/standings")
def create_standing() -> dict:
    return {"message": "not yet implemented"}


@router.post("/player_stats")
def create_player_stats() -> dict:
    return {"message": "not yet implemented"}


@router.post("/match_events")
def create_match_event() -> dict:
    return {"message": "not yet implemented"}


@router.post("/tournaments/refresh-standings")
@limiter.limit("3/minute")
def refresh_standings(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    margin_days: Annotated[int, Query(ge=0, le=30)] = STANDINGS_MARGIN_DAYS,
) -> dict:
    """
    Refresh all refreshable standings (live tournaments) with the given margin.
    Return a summary of successful refreshes and failures.
    """
    return refresh_standings_service.refresh_standings(db, margin_days)


@router.post("/tournaments/refresh-matches")
@limiter.limit("3/minute")
def refresh_matches(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    margin_days: Annotated[int, Query(ge=0, le=30)] = MATCHES_MARGIN_DAYS,
) -> dict:
    """
    Refresh all refreshable matches (live tournaments) with the given margin.
    Return a summary of successful refreshes and failures.
    """
    return refresh_matches_service.refresh_matches(db, margin_days)


@router.post("/tournaments/refresh-match-events")
@limiter.limit("3/minute")
def refresh_match_events(request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    """
    Refresh match events for all currently live matches.
    Return a summary of successful refreshes and failures.
    """
    return refresh_match_events_service.refresh_match_events(db)


@router.post("/tournaments/refresh-team-rankings")
@limiter.limit("3/minute")
def refresh_team_rankings(request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    """
    Refresh team rankings for all live tournaments.
    Derive it based on updated standings and matches data.
    Return a summary of successful refreshes and failures.
    """
    return refresh_team_rankings_service.refresh_team_rankings(db)


@router.post("/tournaments/refresh-team-squads")
@limiter.limit("3/minute")
def refresh_team_squads(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    margin_days: Annotated[int, Query(ge=0, le=30)] = TEAM_SQUADS_MARGIN_DAYS,
) -> dict:
    """
    Refresh team squad for all teams in live tournaments.
    Return a summary of successful refreshes and failures.
    """
    return refresh_team_squads_service.refresh_team_squads(db, margin_days)


@router.post("/tournaments/refresh-player-leaderboards")
@limiter.limit("3/minute")
def refresh_player_leaderboards(request: Request, db: Annotated[Session, Depends(get_db)]) -> dict:
    """
    Refresh player leaderboards for all live tournaments.
    Return a summary of successful refreshes and failures.
    """
    return refresh_player_leaderboards_service.refresh_player_leaderboards(db)


@router.put("/tournaments/{tournament_id}/matches")
@limiter.limit("10/minute")
def update_matches(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: Annotated[int, Path(gt=0)],
    data: list[MatchRefreshRow],
) -> dict:
    matches_service.update_matches(db, tournament_id, data)
    return {"message": "Matches updated successfully"}


@router.put("/matches/{match_id}")
def update_match(match_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.put("/player_stats/{tournament_id}")
def update_player_stats(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}
