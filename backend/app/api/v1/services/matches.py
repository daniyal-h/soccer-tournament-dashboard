from datetime import UTC, datetime

from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import matches as matches_repo
from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import teams as teams_service
from app.api.v1.services import tournament_teams as tournament_teams_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.jobs import JobName
from app.models.match import Match, StageType
from app.schemas.errors import NotFoundError
from app.schemas.matches import MatchRefreshRow
from app.utils.cache_helper import get_expires_at, get_matches_ttl


def get_match(db: Session, match_id: int) -> Match:
    match = matches_repo.get_match_by_id(db, match_id)

    if not match:
        raise NotFoundError(f"Match {match_id} was not found")

    return match


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
        # cache stores serialized response-shaped data
        return cached

    # validate tournament existence before caching an empty match list
    tournament = tournaments_service.get_tournament(db, tournament_id)
    matches = matches_repo.get_matches_by_tournament(db, tournament_id)

    ttl = get_matches_ttl(tournament, matches)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(matches), expires_at=get_expires_at(ttl)
    )

    return matches


def update_matches(db: Session, tournament_id: int, data: list[MatchRefreshRow]) -> None:
    # create a refresh job for logging
    job_id = refresh_jobs_repo.create_job(db, JobName.MATCHES_REFRESH)

    try:
        rows = []

        for row in data:
            # resolve team IDs
            team_a_id = teams_service.get_team_id_from_external_id(db, row.external_team_a_id)
            team_b_id = teams_service.get_team_id_from_external_id(db, row.external_team_b_id)

            group = None

            # resolve group for group matches
            if row.stage == StageType.GROUP:
                team_a_group = tournament_teams_service.get_team_group(
                    db,
                    tournament_id=tournament_id,
                    team_id=team_a_id,
                )
                team_b_group = tournament_teams_service.get_team_group(
                    db,
                    tournament_id=tournament_id,
                    team_id=team_b_id,
                )

                # both should be equal in group matches
                # if not, keep default of None
                if team_a_group and team_a_group == team_b_group:
                    group = team_a_group

            # make the Match object with resolved data
            rows.append(
                Match(
                    external_api_id=row.external_api_id,
                    tournament_id=tournament_id,
                    team_a_id=team_a_id,
                    team_b_id=team_b_id,
                    kickoff_time=row.kickoff_time,
                    stage=row.stage,
                    group=group,
                    status=row.status,
                    venue=row.venue,
                    city=row.city,
                    elapsed=row.elapsed,
                    team_a_score=row.team_a_score,
                    team_b_score=row.team_b_score,
                    team_a_penalties=row.team_a_penalties,
                    team_b_penalties=row.team_b_penalties,
                )
            )

        matches_repo.upsert_matches_in_tournament(db, tournament_id, rows)
        cache_service.invalidate_cache(db, f"matches:{tournament_id}")

        # successful update completes the job
        refresh_jobs_repo.complete_job(db, job_id, success=True)

    except Exception as _:
        refresh_jobs_repo.complete_job(db, job_id, success=False)
        raise


def get_live_matches(db: Session) -> list[Match]:
    now = datetime.now(UTC)

    return matches_repo.get_all_live_matches(db, now)
