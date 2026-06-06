from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import match_events as match_events_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import matches as matches_service
from app.models.match_event import MatchEvent
from app.utils.cache_helper import get_expires_at, get_match_events_ttl


def get_match_events(db: Session, match_id: int) -> list[MatchEvent]:
    cache_key = f"match_events:{match_id}"
    cached = cache_service.get_cache(db, cache_key)

    if cached:
        # cache stores serialized response-shaped data
        return cached

    # validate match existence before retrieving and caching
    match = matches_service.get_match(db, match_id)
    match_events = match_events_repo.get_all_match_events(db, match_id)

    ttl = get_match_events_ttl(match, match_events)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(match_events), expires_at=get_expires_at(ttl)
    )

    return match_events
