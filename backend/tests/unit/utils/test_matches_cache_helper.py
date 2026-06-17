from datetime import UTC, date, datetime, timedelta
from types import SimpleNamespace

import pytest

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
)
from app.models.enums import StatusType
from app.utils.cache_helper import get_matches_ttl

CURRENT_TIME = datetime(2026, 6, 15, 12, 0, tzinfo=UTC)


def make_tournament(
    start_date: date = date(2026, 6, 11),
    end_date: date = date(2026, 7, 19),
):
    return SimpleNamespace(
        start_date=start_date,
        end_date=end_date,
    )


def make_match(
    status: StatusType,
    kickoff_time: datetime = CURRENT_TIME,
):
    return SimpleNamespace(
        status=status,
        kickoff_time=kickoff_time,
    )


class TestGetMatchesTtl:
    def test_returns_pre_tournament_ttl_when_no_matches_and_tournament_has_not_started(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 20),
            end_date=date(2026, 7, 19),
        )

        ttl = get_matches_ttl(tournament, [], now=CURRENT_TIME)

        assert ttl == MATCHES_PRE_TOURNAMENT_TTL

    def test_returns_finished_ttl_when_no_matches_and_tournament_has_ended(self):
        tournament = make_tournament(
            start_date=date(2026, 5, 1),
            end_date=date(2026, 6, 1),
        )

        ttl = get_matches_ttl(tournament, [], now=CURRENT_TIME)

        assert ttl == MATCHES_FINISHED_TTL

    def test_returns_empty_ttl_when_no_matches_and_tournament_is_active(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 1),
        )

        ttl = get_matches_ttl(tournament, [], now=CURRENT_TIME)

        assert ttl == MATCHES_EMPTY_TTL

    def test_start_date_boundary_counts_as_active_when_no_matches(self):
        tournament = make_tournament(
            start_date=CURRENT_TIME.date(),
            end_date=date(2026, 7, 1),
        )

        ttl = get_matches_ttl(tournament, [], now=CURRENT_TIME)

        assert ttl == MATCHES_EMPTY_TTL

    def test_end_date_boundary_counts_as_active_when_no_matches(self):
        tournament = make_tournament(
            start_date=date(2026, 6, 1),
            end_date=CURRENT_TIME.date(),
        )

        ttl = get_matches_ttl(tournament, [], now=CURRENT_TIME)

        assert ttl == MATCHES_EMPTY_TTL

    def test_live_match_returns_live_ttl(self):
        tournament = make_tournament()
        matches = [make_match(StatusType.LIVE)]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_LIVE_TTL

    def test_any_live_match_dominates_finished_cancelled_and_scheduled_matches(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.FINISHED),
            make_match(StatusType.CANCELLED),
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=12)),
            make_match(StatusType.LIVE),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_LIVE_TTL

    def test_scheduled_match_within_three_hours_returns_soon_scheduled_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=2, minutes=59)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_SOON_SCHEDULED_TTL

    def test_scheduled_match_exactly_three_hours_away_returns_soon_scheduled_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=3)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_SOON_SCHEDULED_TTL

    def test_scheduled_match_more_than_three_hours_away_returns_far_scheduled_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=3, minutes=1)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_FAR_SCHEDULED_TTL

    def test_past_scheduled_match_returns_soon_scheduled_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.SCHEDULED, CURRENT_TIME - timedelta(minutes=1)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_SOON_SCHEDULED_TTL

    def test_nearest_scheduled_match_controls_scheduled_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=8)),
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(minutes=30)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_SOON_SCHEDULED_TTL

    def test_scheduled_match_dominates_finished_cancelled_and_postponed_matches(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.FINISHED),
            make_match(StatusType.CANCELLED),
            make_match(StatusType.POSTPONED),
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=8)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_FAR_SCHEDULED_TTL

    def test_all_finished_matches_return_finished_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.FINISHED),
            make_match(StatusType.FINISHED),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_FINISHED_TTL

    def test_all_cancelled_matches_return_cancelled_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.CANCELLED),
            make_match(StatusType.CANCELLED),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_CANCELLED_TTL

    def test_all_postponed_matches_return_postponed_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.POSTPONED),
            make_match(StatusType.POSTPONED),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_POSTPONED_TTL

    def test_mixed_finished_and_cancelled_matches_return_finished_ttl(self):
        tournament = make_tournament()
        matches = [
            make_match(StatusType.FINISHED),
            make_match(StatusType.CANCELLED),
            make_match(StatusType.FINISHED),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_FINISHED_TTL

    @pytest.mark.parametrize(
        "statuses",
        [
            [StatusType.FINISHED, StatusType.POSTPONED],
            [StatusType.CANCELLED, StatusType.POSTPONED],
            [StatusType.FINISHED, StatusType.CANCELLED, StatusType.POSTPONED],
        ],
    )
    def test_non_final_mixed_statuses_without_live_or_scheduled_return_default_ttl(self, statuses):
        tournament = make_tournament()
        matches = [make_match(status) for status in statuses]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_DEFAULT_TTL

    def test_tournament_dates_do_not_override_live_match_status(self):
        tournament = make_tournament(
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 31),
        )
        matches = [make_match(StatusType.LIVE)]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_LIVE_TTL

    def test_tournament_dates_do_not_override_scheduled_match_status(self):
        tournament = make_tournament(
            start_date=date(2026, 1, 1),
            end_date=date(2026, 1, 31),
        )
        matches = [
            make_match(StatusType.SCHEDULED, CURRENT_TIME + timedelta(hours=10)),
        ]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert ttl == MATCHES_FAR_SCHEDULED_TTL

    def test_returns_timedelta_not_integer_minutes(self):
        tournament = make_tournament()
        matches = [make_match(StatusType.LIVE)]

        ttl = get_matches_ttl(tournament, matches, now=CURRENT_TIME)

        assert isinstance(ttl, timedelta)
        assert ttl == timedelta(minutes=5)
