from datetime import UTC, date, datetime, time, timedelta

from app.constants.cache_ttl import (
    MATCHES_CANCELLED_TTL,
    MATCHES_DEFAULT_TTL,
    MATCHES_EMPTY_TTL,
    MATCHES_FAR_SCHEDULED_TTL,
    MATCHES_FINISHED_TTL,
    MATCHES_LIVE_TTL,
    MATCHES_POSTPONED_TTL,
    MATCHES_PRE_TOURNAMENT_TTL,
    MATCHES_SOON_SCHEDULED_TTL,
    STANDINGS_FINISHED_TOURNAMENT_TTL,
    STANDINGS_PRE_TOURNAMENT_FAR_TTL,
    STANDINGS_PRE_TOURNAMENT_SOON_TTL,
    STANDINGS_TTL,
)
from app.models.match import Match, StatusType
from app.models.tournament import Tournament


def get_expires_at(ttl: timedelta) -> datetime:
    return datetime.now(UTC) + ttl


def get_standings_ttl(
    tournament: Tournament,
    has_rows: bool,
    today: date | None = None,
) -> timedelta:
    """
    Determine the cache TTL for tournament standings.

    Empty pre-tournament standings are cached longer when the tournament is far
    away, but refreshed more often near the earliest possible UTC start time.
    Finished tournament standings are effectively static.
    """
    current_date = today or date.today()

    if current_date > tournament.end_date:
        return STANDINGS_FINISHED_TOURNAMENT_TTL

    if not has_rows and current_date < tournament.start_date:
        # get times with date, assuming worst case (at 00:00:00 = time.min)
        current_time = datetime.combine(current_date, time.min, tzinfo=UTC)
        tournament_start = datetime.combine(tournament.start_date, time.min, tzinfo=UTC)

        # within a day is considered "soon", otherwise far
        if tournament_start - current_time <= timedelta(days=1):
            return STANDINGS_PRE_TOURNAMENT_SOON_TTL

        return STANDINGS_PRE_TOURNAMENT_FAR_TTL

    return STANDINGS_TTL


def get_matches_ttl(
    tournament: Tournament,
    matches: list[Match],
    now: datetime | None = None,
) -> timedelta:
    """
    Determine the cache TTL for a tournament schedule.

    The TTL is based on the most volatile match state present in the schedule.
    Live matches receive the shortest TTL, scheduled matches receive a moderate
    TTL based on proximity to kickoff, and completed schedules receive longer
    TTLs. Tournament dates are used as a fallback when no matches exist.
    """
    current_time = now or datetime.now(UTC)
    current_date = current_time.date()

    # tournament has not started and no schedule exists yet
    # match data is unlikely to change frequently
    if not matches:
        if current_date < tournament.start_date:
            return MATCHES_PRE_TOURNAMENT_TTL

        # tournament finished but no rows exist
        if current_date > tournament.end_date:
            return MATCHES_FINISHED_TTL

        # tournament is active but schedule is missing
        return MATCHES_EMPTY_TTL

    # if one match is live, treat entire schedule as live
    statuses = {match.status for match in matches}

    if StatusType.LIVE in statuses:
        return MATCHES_LIVE_TTL

    # scheduled matches may still change
    if StatusType.SCHEDULED in statuses:
        next_kickoff = min(
            match.kickoff_time for match in matches if match.status == StatusType.SCHEDULED
        )

        minutes_until_kickoff = (next_kickoff - current_time).total_seconds() / 60

        # increase refresh frequency when approaching kickoff
        if minutes_until_kickoff <= 180:
            return MATCHES_SOON_SCHEDULED_TTL

        return MATCHES_FAR_SCHEDULED_TTL

    # go by status TTLs if all matches are of that status
    if statuses == {StatusType.FINISHED}:
        return MATCHES_FINISHED_TTL

    if statuses == {StatusType.CANCELLED}:
        return MATCHES_CANCELLED_TTL

    if statuses == {StatusType.POSTPONED}:
        return MATCHES_POSTPONED_TTL

    # mixed finished/cancelled schedules are effectively final
    if statuses <= {StatusType.FINISHED, StatusType.CANCELLED}:
        return MATCHES_FINISHED_TTL

    return MATCHES_DEFAULT_TTL
