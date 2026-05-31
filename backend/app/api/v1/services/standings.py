from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.repositories import standings as standings_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import teams as teams_service
from app.api.v1.services import tournament_teams as tournament_teams_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.jobs import JobName
from app.models.standing import Standing
from app.models.tournament_team import TournamentTeam
from app.schemas.errors import NotFoundError
from app.schemas.standings import StandingRefreshRow
from backend.app.utils.cache_helper import get_expires_at, get_standings_ttl


def build_zero_state_standings(tournament_teams: list[TournamentTeam]) -> list[Standing]:
    """
    Given a list of tournament teams,
    return a list of standing objects in zero-state
    """
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


def get_standings(
    db: Session, tournament_id: int, group: str | None = None
) -> dict[str, list[Standing]]:
    """
    Returns a dictionary of all groups (unless specified) and their standings
    Uses cache if valid
    If the standings table is empty, try to generate a zero-state standings
    """

    # check cache for a valid entry
    cache_key = f"standings:{tournament_id}"
    cached = cache_service.get_cache(db, cache_key)

    # return cache, if group specified, return just the group data
    if cached:
        if group:
            if group not in cached:
                raise NotFoundError(f"Group {group} not found in tournament {tournament_id}")
            return {group: cached[group]}
        return cached

    tournament = tournaments_service.get_tournament(db, tournament_id)
    rows = standings_repo.get_all_standings(db, tournament_id)
    has_persisted_rows = bool(rows)

    # if no standings found, check if group assignments exist for zero-state
    if not rows:
        try:
            # return zero-state standings if there are group assignments
            tournament_teams = tournament_teams_service.get_tournament_teams(db, tournament_id)
            rows = build_zero_state_standings(tournament_teams)

        except NotFoundError:
            raise NotFoundError(f"No standings found for tournament {tournament_id}")

    # get the cache TTL based on the tournament status
    ttl = get_standings_ttl(tournament, has_rows=has_persisted_rows)

    # convert the flat list into a dictionary of groups
    grouped: dict[str, list[Standing]] = {}
    for row in rows:
        grouped.setdefault(row.group, []).append(row)

    # sort each group by FIFA tiebreaker rules
    # first by points, then goal difference, then goals scored (desc)
    for group_rows in grouped.values():
        group_rows.sort(key=lambda r: (-r.points, -(r.goals_for - r.goals_against), -r.goals_for))

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(grouped), expires_at=get_expires_at(ttl)
    )

    # if group was specified, return only those standings
    if group:
        if group not in grouped:
            raise NotFoundError(f"Group {group} not found in tournament {tournament_id}")
        return {group: grouped[group]}  # match response model

    return grouped


def update_standings(db: Session, tournament_id: int, data: list[StandingRefreshRow]) -> None:
    # create a refresh job for logging
    job_id = refresh_jobs_repo.create_job(db, JobName.STANDINGS_REFRESH)

    try:
        rows = []

        for row in data:
            # build the Standings object with resolved team IDs
            team_id = teams_service.get_team_id_from_external_id(db, row.external_team_id)
            rows.append(
                Standing(
                    tournament_id=tournament_id,
                    team_id=team_id,
                    group=row.group,
                    position=row.position,
                    points=row.points,
                    wins=row.wins,
                    draws=row.draws,
                    losses=row.losses,
                    goals_for=row.goals_for,
                    goals_against=row.goals_against,
                )
            )

        standings_repo.update_standings_in_tournament(db, tournament_id, rows)
        cache_service.invalidate_cache(db, f"standings:{tournament_id}")

        # successful update completes the job
        refresh_jobs_repo.complete_job(db, job_id, success=True)

    except Exception as _:
        refresh_jobs_repo.complete_job(db, job_id, success=False)
        raise
