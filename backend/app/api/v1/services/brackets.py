from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import matches as matches_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import tournaments as tournaments_service
from app.models.match import Match
from app.schemas.brackets import BracketResponse
from app.schemas.common import MatchSummary
from app.utils.cache_helper import get_expires_at, get_tournament_data_ttl


def create_bracket(matches: list[Match]) -> BracketResponse:
    bracket = BracketResponse()

    for match in matches:
        stage = match.stage.value

        if stage in BracketResponse.model_fields:
            getattr(bracket, stage).append(MatchSummary.model_validate(match))

    return bracket


def get_bracket(db: Session, tournament_id: int) -> BracketResponse:
    """
    Return a bracket with matches by stage.
    Retrieve all matches in the tournament and group them by stage.
    """
    cache_key = f"bracket:{tournament_id}"
    cached = cache_service.get_cache(db, cache_key)

    if cached is not None:
        # cache stores serialized response-shaped data
        return BracketResponse.model_validate(cached)

    # handles invalid tournament ID
    tournament = tournaments_service.get_tournament(db, tournament_id)
    matches = matches_repo.get_matches_by_tournament(db, tournament_id)

    bracket = create_bracket(matches)

    ttl = get_tournament_data_ttl(tournament)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(bracket), expires_at=get_expires_at(ttl)
    )

    return bracket
