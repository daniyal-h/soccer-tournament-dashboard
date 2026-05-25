from datetime import date
from unittest.mock import Mock

from app.api.v1.services import standings as standings_service
from app.constants.cache_ttl import (
    STANDINGS_FINISHED_TOURNAMENT_TTL,
    STANDINGS_PRE_TOURNAMENT_TTL,
    STANDINGS_TTL,
)


def test_get_standings_ttl_returns_pre_tournament_ttl_when_no_rows_before_start():
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    result = standings_service.get_standings_ttl(
        tournament,
        has_rows=False,
        today=date(2026, 6, 10),
    )

    assert result == STANDINGS_PRE_TOURNAMENT_TTL


def test_get_standings_ttl_returns_live_ttl_when_rows_exist_before_start():
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    result = standings_service.get_standings_ttl(
        tournament,
        has_rows=True,
        today=date(2026, 6, 10),
    )

    assert result == STANDINGS_TTL


def test_get_standings_ttl_returns_finished_tournament_ttl_after_end():
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    result = standings_service.get_standings_ttl(
        tournament,
        has_rows=True,
        today=date(2026, 7, 20),
    )

    assert result == STANDINGS_FINISHED_TOURNAMENT_TTL


def test_get_standings_ttl_returns_live_ttl_during_tournament():
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    result = standings_service.get_standings_ttl(
        tournament,
        has_rows=True,
        today=date(2026, 6, 20),
    )

    assert result == STANDINGS_TTL


def test_get_standings_ttl_returns_live_ttl_on_tournament_start_date():
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    result = standings_service.get_standings_ttl(
        tournament,
        has_rows=False,
        today=date(2026, 6, 11),
    )

    assert result == STANDINGS_TTL


def test_get_standings_ttl_returns_live_ttl_on_tournament_end_date():
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    result = standings_service.get_standings_ttl(
        tournament,
        has_rows=True,
        today=date(2026, 7, 19),
    )

    assert result == STANDINGS_TTL