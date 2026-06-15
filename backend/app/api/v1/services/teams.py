from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import standings as standings_repo
from app.api.v1.repositories import teams as teams_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import tournament_teams as tournament_teams_service
from app.api.v1.services import tournaments as tournaments_service
from app.schemas.common import TeamStandingsSummary
from app.schemas.errors import NotFoundError
from app.schemas.teams import TeamProfileResponse
from app.utils.cache_helper import get_expires_at, get_team_profile_ttl


def get_team_profile(db: Session, tournament_id: int, team_id: int) -> TeamProfileResponse:
    cache_key = f"team_profile:{tournament_id}:{team_id}"
    cached = cache_service.get_cache(db, cache_key)

    if cached is not None:
        # cache stores serialized response-shaped data
        return TeamProfileResponse.model_validate(cached)

    # registration is the source of truth for tournament-scoped team membership
    # handles tournament and team not found error
    tournament = tournaments_service.get_tournament(db, tournament_id) 
    registration = tournament_teams_service.get_tournament_team(db, tournament_id, team_id) 

    standing = standings_repo.get_standings_for_team(db, tournament_id, team_id)

    # build the response with its defined schema
    team_profile = TeamProfileResponse(
        team=registration.team,
        group=registration.group,
        standing=TeamStandingsSummary.model_validate(standing) if standing else None,
    )

    # cache and return data
    ttl = get_team_profile_ttl(tournament)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(team_profile), expires_at=get_expires_at(ttl)
    )

    return team_profile


def get_team_id_from_external_id(db: Session, external_api_id: int) -> int:
    team = teams_repo.get_team_from_external_id(db, external_api_id)

    if not team:
        raise NotFoundError(f"Team with external id {external_api_id} not found")

    return team.id
