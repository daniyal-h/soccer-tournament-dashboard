from unittest.mock import Mock

from app.api.v1.services.match_events import get_match_events_ttl
from app.constants.cache_ttl import (
    MATCH_EVENTS_DEFAULT_TTL,
    MATCH_EVENTS_FINISHED_TTL,
    MATCH_EVENTS_LIVE_GROUP_TTL,
    MATCH_EVENTS_LIVE_KNOCKOUT_TTL,
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
        stage=StageType.FINAL,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_LIVE_KNOCKOUT_TTL


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


def test_get_match_events_ttl_returns_default_for_non_live_non_finished():
    match = Mock(
        status=StatusType.SCHEDULED,
        stage=StageType.GROUP,
    )

    result = get_match_events_ttl(match, [])

    assert result == MATCH_EVENTS_DEFAULT_TTL
