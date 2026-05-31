from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.api.v1.services import standings as standings_service
from app.api.v1.services import tournaments as tournaments_service
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.standings import StandingRefreshRow

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


# get all refreshable tournaments within the margin (defaults to 1 day)
@router.get("/tournaments/refreshable")
@limiter.limit("10/minute")
def get_refreshable_tournaments(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    margin_days: Annotated[int, Query(ge=0)] = 1,
):
    return tournaments_service.get_refreshable_tournaments(db, margin_days)


@router.put("/tournaments/{tournament_id}/standings")
@limiter.limit("3/minute")
def update_standings(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
    tournament_id: int,
    data: list[StandingRefreshRow],
) -> dict:
    standings_service.update_standings(db, tournament_id, data)
    return {"message": "Standings updated successfully"}


@router.put("/matches/{match_id}")
def update_match(match_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.put("/player_stats/{tournament_id}")
def update_player_stats(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}
