from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, Request
from sqlalchemy.orm import Session

from app.api.v1.services import matches as matches_service
from app.api.v1.services import refresh_matches as refresh_matches_service
from app.api.v1.services import refresh_standings as refresh_standings_service
from backend.app.api.v1.services import refresh_match_events as refresh_match_events_service
from app.constants.external_apis import MATCHES_MARGIN_DAYS, STANDINGS_MARGIN_DAYS
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


@router.post('/tournaments/refresh-match-events')
@limiter.limit("3/minute")
def refresh_match_events(
    request: Request,
    db: Annotated[Session, Depends(get_db)]
) -> dict:
    """
    Refresh match events for all currently live matches.
    Return a summary of successful refreshes and failures.
    """
    return refresh_match_events_service.refresh_match_events(db)


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
