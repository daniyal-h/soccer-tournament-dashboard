from datetime import UTC, datetime, timedelta
from unittest.mock import Mock

from app.api.v1.services.match_events import get_match_events_ttl
from app.constants.cache_ttl import (
    MATCH_EVENTS_DEFAULT_TTL,
    MATCH_EVENTS_FAR_SCHEDULED_TTL,
    MATCH_EVENTS_FINISHED_TTL,
    MATCH_EVENTS_LIVE_GROUP_TTL,
    MATCH_EVENTS_LIVE_KNOCKOUT_TTL,
    MATCH_EVENTS_SOON_SCHEDULED_TTL,
)
from app.models.match import StageType, StatusType


def test_get_match_events_ttl_returns_group_live_ttl():
    match = Mock(
        status=StatusType.LIVE,
        stage=StageType.GROUP,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_LIVE_GROUP_TTL


def test_get_match_events_ttl_returns_knockout_live_ttl():
    match = Mock(
        status=StatusType.LIVE,
        stage=StageType.ROUND_OF_32,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_LIVE_KNOCKOUT_TTL


def test_get_match_events_ttl_returns_knockout_live_ttl_for_other_live_stage():
    match = Mock(
        status=StatusType.LIVE,
        stage=StageType.OTHER,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_LIVE_KNOCKOUT_TTL


def test_get_match_events_ttl_returns_soon_scheduled_ttl_when_kickoff_is_within_one_day():
    now = datetime(2026, 6, 10, 12, 0, tzinfo=UTC)
    match = Mock(
        status=StatusType.SCHEDULED,
        stage=StageType.GROUP,
        kickoff_time=now + timedelta(hours=23, minutes=59),
    )

    result = get_match_events_ttl(match, [], now=now)

    assert result == MATCH_EVENTS_SOON_SCHEDULED_TTL


def test_get_match_events_ttl_returns_soon_scheduled_ttl_when_kickoff_is_exactly_one_day_away():
    now = datetime(2026, 6, 10, 12, 0, tzinfo=UTC)
    match = Mock(
        status=StatusType.SCHEDULED,
        stage=StageType.GROUP,
        kickoff_time=now + timedelta(days=1),
    )

    result = get_match_events_ttl(match, [], now=now)

    assert result == MATCH_EVENTS_SOON_SCHEDULED_TTL


def test_get_match_events_ttl_returns_far_scheduled_ttl_when_kickoff_is_more_than_one_day_away():
    now = datetime(2026, 6, 10, 12, 0, tzinfo=UTC)
    match = Mock(
        status=StatusType.SCHEDULED,
        stage=StageType.GROUP,
        kickoff_time=now + timedelta(days=1, seconds=1),
    )

    result = get_match_events_ttl(match, [], now=now)

    assert result == MATCH_EVENTS_FAR_SCHEDULED_TTL


def test_get_match_events_ttl_returns_soon_when_kickoff_time_has_passed_but_is_still_scheduled():
    now = datetime(2026, 6, 10, 12, 0, tzinfo=UTC)
    match = Mock(
        status=StatusType.SCHEDULED,
        stage=StageType.GROUP,
        kickoff_time=now - timedelta(minutes=1),
    )

    result = get_match_events_ttl(match, [], now=now)

    assert result == MATCH_EVENTS_SOON_SCHEDULED_TTL


def test_get_match_events_ttl_returns_finished_ttl_when_events_exist():
    match = Mock(
        status=StatusType.FINISHED,
        stage=StageType.GROUP,
    )

    result = get_match_events_ttl(match, [Mock()])

    assert result == MATCH_EVENTS_FINISHED_TTL


def test_get_match_events_ttl_returns_default_when_finished_without_events():
    match = Mock(
        status=StatusType.FINISHED,
        stage=StageType.GROUP,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_DEFAULT_TTL


def test_get_match_events_ttl_returns_default_for_non_live_non_scheduled_non_finished_status():
    match = Mock(
        status=StatusType.POSTPONED,
        stage=StageType.GROUP,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_DEFAULT_TTL
