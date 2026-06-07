from typing import Annotated

from fastapi import APIRouter, Depends, Path, Request
from sqlalchemy.orm import Session

from app.api.v1.services import match_events as match_events_service
from app.api.v1.services import matches as matches_service
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.match_events import MatchEventsResponse
from app.schemas.matches import MatchResponse

router = APIRouter()


@router.get("/{match_id}", response_model=MatchResponse)
@limiter.limit("60/minute")
def get_match(
    request: Request, db: Annotated[Session, Depends(get_db)], match_id: Annotated[int, Path(gt=0)]
):
    """
    Return the specified match if it exists.
    """
    return matches_service.get_match(db, match_id)


@router.get("/{match_id}/events", response_model=MatchEventsResponse)
@limiter.limit("60/minute")
def get_match_events(
    request: Request, db: Annotated[Session, Depends(get_db)], match_id: Annotated[int, Path(gt=0)]
):
    """
    Return all events in the given match, ordered chronologically.
    May return an empty list for match events not yet populated.
    """

    return match_events_service.get_match_events(db, match_id)
