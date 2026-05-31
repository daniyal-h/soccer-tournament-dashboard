from datetime import date, timedelta
from types import SimpleNamespace

from app.constants.cache_ttl import (
    STANDINGS_FINISHED_TOURNAMENT_TTL,
    STANDINGS_PRE_TOURNAMENT_FAR_TTL,
    STANDINGS_PRE_TOURNAMENT_SOON_TTL,
    STANDINGS_TTL,
)
from app.utils.cache_helper import get_standings_ttl


def make_tournament(
    start_date: date = date(2026, 6, 11),
    end_date: date = date(2026, 7, 19),
):
    return SimpleNamespace(
        start_date=start_date,
        end_date=end_date,
    )


class TestGetStandingsTtl:
    def test_returns_finished_tournament_ttl_after_end_date_even_without_rows(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 10),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 6, 11))

        assert ttl == STANDINGS_FINISHED_TOURNAMENT_TTL

    def test_returns_finished_tournament_ttl_after_end_date_even_with_rows(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 10),
        )

        ttl = get_standings_ttl(tournament, has_rows=True, today=date(2026, 6, 11))

        assert ttl == STANDINGS_FINISHED_TOURNAMENT_TTL

    def test_returns_far_pre_tournament_ttl_when_empty_and_more_than_one_day_before_start(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 6, 9))

        assert ttl == STANDINGS_PRE_TOURNAMENT_FAR_TTL

    def test_returns_soon_pre_tournament_ttl_when_empty_and_exactly_one_day_before_start(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 6, 10))

        assert ttl == STANDINGS_PRE_TOURNAMENT_SOON_TTL

    def test_returns_default_standings_ttl_on_start_date_when_empty(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 6, 11))

        assert ttl == STANDINGS_TTL

    def test_returns_default_standings_ttl_on_end_date_when_empty(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 7, 19))

        assert ttl == STANDINGS_TTL

    def test_returns_default_standings_ttl_during_active_tournament_when_empty(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 6, 20))

        assert ttl == STANDINGS_TTL

    def test_returns_default_standings_ttl_before_tournament_when_rows_exist(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=True, today=date(2026, 6, 9))

        assert ttl == STANDINGS_TTL

    def test_returns_default_standings_ttl_during_tournament_when_rows_exist(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=True, today=date(2026, 6, 20))

        assert ttl == STANDINGS_TTL

    def test_returns_default_standings_ttl_on_start_date_when_rows_exist(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=True, today=date(2026, 6, 11))

        assert ttl == STANDINGS_TTL

    def test_returns_default_standings_ttl_on_end_date_when_rows_exist(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=True, today=date(2026, 7, 19))

        assert ttl == STANDINGS_TTL

    def test_returns_timedelta_values_not_integer_minutes(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 11),
            end_date=date(2026, 7, 19),
        )

        ttl = get_standings_ttl(tournament, has_rows=False, today=date(2026, 6, 10))

        assert isinstance(ttl, timedelta)
        assert ttl == timedelta(minutes=15)
