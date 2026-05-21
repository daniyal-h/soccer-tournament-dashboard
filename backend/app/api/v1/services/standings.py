from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import standings as standings_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import tournament_teams as tournament_teams_service
from app.constants.cache_ttl import STANDINGS_PRE_TOURNAMENT_TTL, STANDINGS_TTL
from app.models.standing import Standing
from app.models.tournament_team import TournamentTeam
from app.schemas.errors import NotFoundError
from app.utils.cache import get_expires_at


# return a standings of teams in zero state
def build_zero_state_standings(tournament_teams: list[TournamentTeam]) -> list[Standing]:
    return [
        Standing(
            tournament_id=tt.tournament_id,
            team_id=tt.team_id,
            group=tt.group,
            position=0,
            points=0,
            wins=0,
            draws=0,
            losses=0,
            goals_for=0,
            goals_against=0,
            team=tt.team,
        )
        for tt in tournament_teams
    ]


# return a dictionary of all groups (unless specified) and their standings
def get_standings(
    db: Session, tournament_id: int, group: str | None = None
) -> dict[str, list[Standing]]:
    # check cache for a valid entry
    cache_key = f"standings:{tournament_id}"
    ttl = STANDINGS_TTL  # used to calculate expiry time, default to standings TTL
    cached = cache_service.get_cache(db, cache_key)

    # return cache, if group specified, return just the group data
    if cached:
        if group:
            if group not in cached:
                raise NotFoundError(f"Group {group} not found in tournament {tournament_id}")
            return {group: cached[group]}
        return cached

    # get a flat list of standings
    rows = standings_repo.get_all_standings(db, tournament_id)

    # if no standings found, check if group assignments exist for zero-state
    if not rows:
        try:
            # return zero-state standings if there are group assignments
            tournament_teams = tournament_teams_service.get_tournament_teams(db, tournament_id)
            rows = build_zero_state_standings(tournament_teams)
            ttl = STANDINGS_PRE_TOURNAMENT_TTL  # update to pre-tournament TTL

        except NotFoundError:
            raise NotFoundError(f"No standings found for tournament {tournament_id}")

    # convert the flat list into a dictionary of groups
    grouped: dict[str, list[Standing]] = {}
    for row in rows:
        grouped.setdefault(row.group, []).append(row)

    # sort each group by FIFA tiebreaker rules
    # first by points, then goal difference, then goals scored (desc)
    for group_rows in grouped.values():
        group_rows.sort(key=lambda r: (-r.points, -(r.goals_for - r.goals_against), -r.goals_for))

    cache_service.set_cache(
        db, cache_key, jsonable_encoder(grouped), expires_at=get_expires_at(ttl)
    )

    # if group was specified, return only those standings
    if group:
        if group not in grouped:
            raise NotFoundError(f"Group {group} not found in tournament {tournament_id}")
        return {group: grouped[group]}  # match response model

    return grouped
