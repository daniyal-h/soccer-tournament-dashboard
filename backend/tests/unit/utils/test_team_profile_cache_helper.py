from datetime import date
from unittest.mock import Mock

from app.constants.cache_ttl import (
    TEAM_PROFILE_FINISHED_TTL,
    TEAM_PROFILE_PRE_TOURNAMENT_FAR_TTL,
    TEAM_PROFILE_PRE_TOURNAMENT_SOON_TTL,
    TEAM_PROFILE_TTL,
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

    assert result == TEAM_PROFILE_PRE_TOURNAMENT_FAR_TTL


def test_get_team_profile_ttl_returns_soon_pre_tournament_ttl_one_day_before_start():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 6, 10),
    )

    assert result == TEAM_PROFILE_PRE_TOURNAMENT_SOON_TTL


def test_get_team_profile_ttl_returns_ongoing_ttl_on_start_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 6, 11),
    )

    assert result == TEAM_PROFILE_TTL


def test_get_team_profile_ttl_returns_ongoing_ttl_before_end_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 7, 18),
    )

    assert result == TEAM_PROFILE_TTL


def test_get_team_profile_ttl_returns_ongoing_ttl_on_end_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 7, 19),
    )

    assert result == TEAM_PROFILE_TTL


def test_get_team_profile_ttl_returns_finished_ttl_after_end_date():
    tournament = Mock(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    result = get_team_profile_ttl(
        tournament,
        today=date(2026, 7, 20),
    )

    assert result == TEAM_PROFILE_FINISHED_TTL
