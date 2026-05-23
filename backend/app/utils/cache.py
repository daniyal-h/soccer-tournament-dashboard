from datetime import UTC, date, datetime, timedelta

from app.constants.cache_ttl import (
    STANDINGS_FINISHED_TOURNAMENT_TTL,
    STANDINGS_PRE_TOURNAMENT_TTL,
    STANDINGS_TTL,
)
from app.models.tournament import Tournament


def get_expires_at(ttl: timedelta) -> datetime:
    return datetime.now(UTC) + ttl


# TTL for standings based on tournament status
def get_standings_ttl(tournament: Tournament, has_rows: bool) -> int:
    today = date.today()

    if not has_rows and today < tournament.start_date:
        return STANDINGS_PRE_TOURNAMENT_TTL

    if today > tournament.end_date:
        return STANDINGS_FINISHED_TOURNAMENT_TTL

    return STANDINGS_TTL
