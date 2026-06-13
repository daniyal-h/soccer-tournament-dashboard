from datetime import UTC, date, datetime, time, timedelta

from app.constants.cache_ttl import (
    MATCH_EVENTS_DEFAULT_TTL,
    MATCH_EVENTS_FAR_SCHEDULED_TTL,
    MATCH_EVENTS_FINISHED_TTL,
    MATCH_EVENTS_LIVE_GROUP_TTL,
    MATCH_EVENTS_LIVE_KNOCKOUT_TTL,
    MATCH_EVENTS_SOON_SCHEDULED_TTL,
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
    TEAMS_FINISHED_TTL,
    TEAMS_GROUP_STAGE_TTL,
    TEAMS_KNOCKOUT_TTL,
    TEAMS_PRE_TOURNAMENT_FAR_TTL,
    TEAMS_PRE_TOURNAMENT_SOON_TTL,
)
from app.constants.team_rankings import KNOCKOUT_STAGES
from app.models.match import Match, StageType, StatusType
from app.models.match_event import MatchEvent
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam


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


def get_match_events_ttl(
    match: Match,
    match_events: list[MatchEvent],
    now: datetime | None = None,
) -> timedelta:
    """
    Determine the cache TTL for match events.

    A match's status determines its TTL.
    Live matches have the lowest TTL.
    Scheduled matches are cached longer when far away, but refreshed more often
    within one day of kickoff.
    """
    current_time = now or datetime.now(UTC)

    if match.status == StatusType.LIVE:
        if match.stage == StageType.GROUP:
            return MATCH_EVENTS_LIVE_GROUP_TTL

        return MATCH_EVENTS_LIVE_KNOCKOUT_TTL

    if match.status == StatusType.SCHEDULED:
        if match.kickoff_time - current_time <= timedelta(days=1):
            return MATCH_EVENTS_SOON_SCHEDULED_TTL

        return MATCH_EVENTS_FAR_SCHEDULED_TTL

    if match.status == StatusType.FINISHED and match_events:
        # ensure match events exist to prevent caching empty finished data for too long
        return MATCH_EVENTS_FINISHED_TTL

    return MATCH_EVENTS_DEFAULT_TTL


def get_teams_ttl(
    tournament: Tournament, teams: list[TournamentTeam], now: datetime | None = None
) -> timedelta:
    """
    Determine the cache TTL for teams.

    Pre- and post-tournament teams are static.
    Ongoing tournaments differ in TTL based on group or knockout stage.
    """
    current_time = now or datetime.now(UTC)

    # convert date to datetimes for comparisons
    tournament_start = datetime.combine(tournament.start_date, time.min, tzinfo=UTC)
    tournament_end = datetime.combine(tournament.end_date, time.min, tzinfo=UTC)

    # pre- and post-tournaments
    if current_time > tournament_end and all(team.final_rank is not None for team in teams):
        return TEAMS_FINISHED_TTL

    if tournament_start > current_time:
        if tournament_start > current_time + timedelta(days=1):
            return TEAMS_PRE_TOURNAMENT_FAR_TTL

        return TEAMS_PRE_TOURNAMENT_SOON_TTL

    # ongoing tournament is done group play if even one has reached a knockout stage
    stages_reached = {team.stage_reached for team in teams}

    finished_group_play = bool(stages_reached & KNOCKOUT_STAGES)

    if finished_group_play:
        return TEAMS_KNOCKOUT_TTL
    else:
        return TEAMS_GROUP_STAGE_TTL
