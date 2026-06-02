from typing import Annotated

from fastapi import APIRouter, Depends, Path, Request
from sqlalchemy.orm import Session

from app.api.v1.services import match_events as match_events_service
from app.core.database import get_db
from app.middleware.rate_limit import limiter
from app.schemas.match_events import MatchEventResponse

router = APIRouter()


@router.get("/{match_id}/events", response_model=list[MatchEventResponse])
@limiter.limit("60/minute")
def get_match_events(
    request: Request, db: Annotated[Session, Depends(get_db)], match_id: Annotated[int, Path(gt=0)]
):
    """
    Return all events in the given match, ordered ascending.
    """

    return match_events_service.get_match_events(db, get_db)
