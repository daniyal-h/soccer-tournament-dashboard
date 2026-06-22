from datetime import date
from unittest.mock import Mock

from app.constants.cache_ttl import (
    TOURNAMENT_DATA_ACTIVE_TTL,
    TOURNAMENT_DATA_FINISHED_TTL,
    TOURNAMENT_DATA_PRE_TOURNAMENT_FAR_TTL,
    TOURNAMENT_DATA_PRE_TOURNAMENT_SOON_TTL,
)
from app.utils.cache_helper import get_team_profile_ttl


def test_get_team_profile_ttl_returns_far_pre_tournament_ttl():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 6, 9),
    )

    assert result == TOURNAMENT_DATA_PRE_TOURNAMENT_FAR_TTL


def test_get_team_profile_ttl_returns_soon_pre_tournament_ttl_one_day_before_start():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 6, 10),
    )

    assert result == TOURNAMENT_DATA_PRE_TOURNAMENT_SOON_TTL


def test_get_team_profile_ttl_returns_ongoing_ttl_on_start_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 6, 11),
    )

    assert result == TOURNAMENT_DATA_ACTIVE_TTL


def test_get_team_profile_ttl_returns_ongoing_ttl_before_end_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 7, 18),
    )

    assert result == TOURNAMENT_DATA_ACTIVE_TTL


def test_get_team_profile_ttl_returns_ongoing_ttl_on_end_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 7, 19),
    )

    assert result == TOURNAMENT_DATA_ACTIVE_TTL


def test_get_team_profile_ttl_returns_finished_ttl_after_end_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 7, 20),
    )

    assert result == TOURNAMENT_DATA_FINISHED_TTL
