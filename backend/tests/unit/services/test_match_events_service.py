from datetime import timedelta
from unittest.mock import Mock

from app.api.v1.services import match_events as match_events_service


def test_get_match_events_returns_cached_events_without_repo_calls(mocker):
    db = Mock()
    cached_events = [
        {
            "team": {"id": 1, "name": "Canada"},
            "player_name": "J. David",
            "event_type": "goal",
            "minute": 80,
            "extra_minute": None,
            "comments": None,
        }
    ]

    get_cache = mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=cached_events,
    )
    get_match = mocker.patch.object(match_events_service.matches_service, "get_match")
    get_all_match_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
    )
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    result = match_events_service.get_match_events(db, 42)

    assert result == cached_events
    get_cache.assert_called_once_with(db, "match_events:42")
    get_match.assert_not_called()
    get_all_match_events.assert_not_called()
    set_cache.assert_not_called()


def test_get_match_events_validates_match_fetches_events_and_caches_encoded_payload(mocker):
    db = Mock()
    match = Mock()
    event = Mock()
    encoded_events = [
        {
            "team": {"id": 1, "name": "Canada"},
            "player_name": "J. David",
            "event_type": "goal",
            "minute": 80,
        }
    ]
    expires_at = Mock()

    mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_match = mocker.patch.object(
        match_events_service.matches_service,
        "get_match",
        return_value=match,
    )
    get_all_match_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
        return_value=[event],
    )
    get_ttl = mocker.patch.object(
        match_events_service,
        "get_match_events_ttl",
        return_value=timedelta(minutes=5),
    )
    get_expires_at = mocker.patch.object(
        match_events_service,
        "get_expires_at",
        return_value=expires_at,
    )
    jsonable_encoder = mocker.patch.object(
        match_events_service,
        "jsonable_encoder",
        return_value=encoded_events,
    )
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    result = match_events_service.get_match_events(db, 42)

    assert result == [event]

    get_match.assert_called_once_with(db, 42)
    get_all_match_events.assert_called_once_with(db, 42)
    get_ttl.assert_called_once_with(match, [event])
    get_expires_at.assert_called_once_with(timedelta(minutes=5))
    jsonable_encoder.assert_called_once_with([event])
    set_cache.assert_called_once_with(
        db,
        "match_events:42",
        payload=encoded_events,
        expires_at=expires_at,
    )


def test_get_match_events_caches_empty_event_list_for_existing_match(mocker):
    db = Mock()
    match = Mock()
    expires_at = Mock()

    mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        match_events_service.matches_service,
        "get_match",
        return_value=match,
    )
    mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
        return_value=[],
    )
    get_ttl = mocker.patch.object(
        match_events_service,
        "get_match_events_ttl",
        return_value=timedelta(minutes=5),
    )
    mocker.patch.object(
        match_events_service,
        "get_expires_at",
        return_value=expires_at,
    )
    mocker.patch.object(
        match_events_service,
        "jsonable_encoder",
        return_value=[],
    )
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    result = match_events_service.get_match_events(db, 42)

    assert result == []
    get_ttl.assert_called_once_with(match, [])
    set_cache.assert_called_once_with(
        db,
        "match_events:42",
        payload=[],
        expires_at=expires_at,
    )


def test_get_match_events_does_not_fetch_events_when_match_validation_fails(mocker):
    db = Mock()

    mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        match_events_service.matches_service,
        "get_match",
        side_effect=RuntimeError("match not found"),
    )
    get_all_match_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
    )
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    try:
        match_events_service.get_match_events(db, 42)
    except RuntimeError as exc:
        assert str(exc) == "match not found"
    else:
        raise AssertionError("Expected get_match_events to raise")

    get_all_match_events.assert_not_called()
    set_cache.assert_not_called()
