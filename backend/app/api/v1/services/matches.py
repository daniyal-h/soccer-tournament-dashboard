from backend.app.utils.cache_helper import get_expires_at, get_matches_ttl
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import matches as matches_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import tournaments as tournaments_service
from app.models.match import Match


def get_matches(db: Session, tournament_id: int) -> list[Match]:
    """
    Return cached match data when available.

    If the cache is invalid, validate that the tournament exists,
    read matches from the database, cache the encoded payload using a TTL based
    on match volatility, and return the database rows. An empty match list is a
    valid response.
    """
    cache_key = f"matches:{tournament_id}"
    cached = cache_service.get_cache(db, cache_key)

    if cached:
        return cached

    # validate tournament existence before caching an empty match list
    tournament = tournaments_service.get_tournament(db, tournament_id)
    matches = matches_repo.get_matches_by_tournament(db, tournament_id)

    ttl = get_matches_ttl(tournament, matches)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(matches), expires_at=get_expires_at(ttl)
    )

    return matches
