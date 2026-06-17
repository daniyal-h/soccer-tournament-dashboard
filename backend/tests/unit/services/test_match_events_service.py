from datetime import timedelta
from unittest.mock import Mock

import pytest

from app.api.v1.services import match_events as match_events_service
from app.models.enums import EventType


def make_match(match_id=42):
    match = Mock()
    match.id = match_id
    return match


def test_get_match_events_returns_cached_events_without_repo_calls(mocker):
    db = Mock()
    match = make_match(42)
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
    get_ttl = mocker.patch.object(match_events_service, "get_match_events_ttl")
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    result = match_events_service.get_match_events(db, match)

    assert result == cached_events
    get_cache.assert_called_once_with(db, "match_events:42")
    get_match.assert_not_called()
    get_all_match_events.assert_not_called()
    get_ttl.assert_not_called()
    set_cache.assert_not_called()


def test_get_match_events_returns_cached_empty_list_without_repo_calls(mocker):
    db = Mock()
    match = make_match(42)

    get_cache = mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=[],
    )
    get_all_match_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
    )
    get_ttl = mocker.patch.object(match_events_service, "get_match_events_ttl")
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    result = match_events_service.get_match_events(db, match)

    assert result == []
    get_cache.assert_called_once_with(db, "match_events:42")
    get_all_match_events.assert_not_called()
    get_ttl.assert_not_called()
    set_cache.assert_not_called()


def test_get_match_events_fetches_events_and_caches_encoded_payload(mocker):
    db = Mock()
    match = make_match(42)
    event = Mock()
    encoded_events = [
        {
            "team": {"id": 1, "name": "Canada"},
            "player_name": "J. David",
            "event_type": "goal",
            "minute": 80,
        }
    ]
    ttl = timedelta(minutes=5)
    expires_at = Mock()

    get_cache = mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_match = mocker.patch.object(match_events_service.matches_service, "get_match")
    get_all_match_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
        return_value=[event],
    )
    get_ttl = mocker.patch.object(
        match_events_service,
        "get_match_events_ttl",
        return_value=ttl,
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

    result = match_events_service.get_match_events(db, match)

    assert result == [event]
    get_cache.assert_called_once_with(db, "match_events:42")
    get_match.assert_not_called()
    get_all_match_events.assert_called_once_with(db, 42)
    get_ttl.assert_called_once_with(match, [event])
    get_expires_at.assert_called_once_with(ttl)
    jsonable_encoder.assert_called_once_with([event])
    set_cache.assert_called_once_with(
        db,
        "match_events:42",
        payload=encoded_events,
        expires_at=expires_at,
    )


def test_get_match_events_caches_empty_event_list_for_existing_match(mocker):
    db = Mock()
    match = make_match(42)
    ttl = timedelta(minutes=5)
    expires_at = Mock()

    mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_all_match_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
        return_value=[],
    )
    get_ttl = mocker.patch.object(
        match_events_service,
        "get_match_events_ttl",
        return_value=ttl,
    )
    get_expires_at = mocker.patch.object(
        match_events_service,
        "get_expires_at",
        return_value=expires_at,
    )
    jsonable_encoder = mocker.patch.object(
        match_events_service,
        "jsonable_encoder",
        return_value=[],
    )
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    result = match_events_service.get_match_events(db, match)

    assert result == []
    get_all_match_events.assert_called_once_with(db, 42)
    get_ttl.assert_called_once_with(match, [])
    get_expires_at.assert_called_once_with(ttl)
    jsonable_encoder.assert_called_once_with([])
    set_cache.assert_called_once_with(
        db,
        "match_events:42",
        payload=[],
        expires_at=expires_at,
    )


def test_get_match_events_does_not_cache_when_repo_fails(mocker):
    db = Mock()
    match = make_match(42)

    mocker.patch.object(
        match_events_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        match_events_service.match_events_repo,
        "get_all_match_events",
        side_effect=RuntimeError("repo failed"),
    )
    get_ttl = mocker.patch.object(match_events_service, "get_match_events_ttl")
    set_cache = mocker.patch.object(match_events_service.cache_service, "set_cache")

    with pytest.raises(RuntimeError, match="repo failed"):
        match_events_service.get_match_events(db, match)

    get_ttl.assert_not_called()
    set_cache.assert_not_called()


def test_get_match_events_response_validates_match_loads_events_and_metadata(mocker):
    db = Mock()
    match = make_match(42)
    events = [Mock()]
    metadata = Mock()
    response = Mock()

    get_match = mocker.patch.object(
        match_events_service.matches_service,
        "get_match",
        return_value=match,
    )
    get_match_events = mocker.patch.object(
        match_events_service,
        "get_match_events",
        return_value=events,
    )
    get_metadata = mocker.patch.object(
        match_events_service,
        "get_match_events_delay_metadata",
        return_value=metadata,
    )
    match_events_response = mocker.patch.object(
        match_events_service,
        "MatchEventsResponse",
        return_value=response,
    )

    result = match_events_service.get_match_events_response(db, 42)

    assert result == response
    get_match.assert_called_once_with(db, 42)
    get_match_events.assert_called_once_with(db, match)
    get_metadata.assert_called_once_with(db, match)
    match_events_response.assert_called_once_with(data=events, metadata=metadata)


def test_get_match_events_response_does_not_fetch_events_when_match_validation_fails(mocker):
    db = Mock()

    mocker.patch.object(
        match_events_service.matches_service,
        "get_match",
        side_effect=RuntimeError("match not found"),
    )
    get_match_events = mocker.patch.object(match_events_service, "get_match_events")
    get_metadata = mocker.patch.object(match_events_service, "get_match_events_delay_metadata")

    with pytest.raises(RuntimeError, match="match not found"):
        match_events_service.get_match_events_response(db, 42)

    get_match_events.assert_not_called()
    get_metadata.assert_not_called()


def test_get_match_events_response_does_not_get_metadata_when_event_fetch_fails(mocker):
    db = Mock()
    match = make_match(42)

    mocker.patch.object(
        match_events_service.matches_service,
        "get_match",
        return_value=match,
    )
    mocker.patch.object(
        match_events_service,
        "get_match_events",
        side_effect=RuntimeError("events failed"),
    )
    get_metadata = mocker.patch.object(match_events_service, "get_match_events_delay_metadata")

    with pytest.raises(RuntimeError, match="events failed"):
        match_events_service.get_match_events_response(db, 42)

    get_metadata.assert_not_called()


def test_update_match_events_replaces_rows_and_invalidates_cache(mocker):
    db = Mock()
    first_row = Mock(
        external_team_id=10,
        player_external_id=100,
        secondary_player_external_id=200,
        player_name="J. David",
        secondary_player_name="A. Davies",
        event_type=EventType.GOAL,
        minute=80,
        extra_minute=2,
        detail="Normal Goal",
        comments="right footed shot",
    )
    second_row = Mock(
        external_team_id=20,
        player_external_id=None,
        secondary_player_external_id=None,
        player_name="Unknown player",
        secondary_player_name=None,
        event_type=EventType.YELLOW_CARD,
        minute=90,
        extra_minute=None,
        detail=None,
        comments=None,
    )
    first_event = Mock()
    second_event = Mock()

    get_team_id = mocker.patch.object(
        match_events_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[1, 2],
    )
    get_player_id = mocker.patch.object(
        match_events_service.players_service,
        "get_optional_player_id_from_external_id",
        side_effect=[11, 22, None, None],
    )
    match_event = mocker.patch.object(
        match_events_service,
        "MatchEvent",
        side_effect=[first_event, second_event],
    )
    replace_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "replace_match_events_for_match",
    )
    invalidate_cache = mocker.patch.object(
        match_events_service.cache_service,
        "invalidate_cache",
    )

    match_events_service.update_match_events(db, 42, [first_row, second_row])

    assert get_team_id.call_args_list == [
        mocker.call(db, 10),
        mocker.call(db, 20),
    ]
    assert get_player_id.call_args_list == [
        mocker.call(db, 100),
        mocker.call(db, 200),
        mocker.call(db, None),
        mocker.call(db, None),
    ]
    assert match_event.call_args_list == [
        mocker.call(
            match_id=42,
            team_id=1,
            player_id=11,
            secondary_player_id=22,
            player_external_id=100,
            secondary_player_external_id=200,
            player_name="J. David",
            secondary_player_name="A. Davies",
            event_type=EventType.GOAL,
            minute=80,
            extra_minute=2,
            detail="Normal Goal",
            comments="right footed shot",
        ),
        mocker.call(
            match_id=42,
            team_id=2,
            player_id=None,
            secondary_player_id=None,
            player_external_id=None,
            secondary_player_external_id=None,
            player_name="Unknown player",
            secondary_player_name=None,
            event_type=EventType.YELLOW_CARD,
            minute=90,
            extra_minute=None,
            detail=None,
            comments=None,
        ),
    ]
    replace_events.assert_called_once_with(db, 42, [first_event, second_event])
    invalidate_cache.assert_called_once_with(db, "match_events:42")


def test_update_match_events_replaces_with_empty_list_and_invalidates_cache(mocker):
    db = Mock()

    get_team_id = mocker.patch.object(
        match_events_service.teams_service,
        "get_team_id_from_external_id",
    )
    get_player_id = mocker.patch.object(
        match_events_service.players_service,
        "get_optional_player_id_from_external_id",
    )
    match_event = mocker.patch.object(match_events_service, "MatchEvent")
    replace_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "replace_match_events_for_match",
    )
    invalidate_cache = mocker.patch.object(
        match_events_service.cache_service,
        "invalidate_cache",
    )

    match_events_service.update_match_events(db, 42, [])

    get_team_id.assert_not_called()
    get_player_id.assert_not_called()
    match_event.assert_not_called()
    replace_events.assert_called_once_with(db, 42, [])
    invalidate_cache.assert_called_once_with(db, "match_events:42")


def test_update_match_events_does_not_replace_or_invalidate_when_team_lookup_fails(mocker):
    db = Mock()
    row = Mock(
        external_team_id=10,
        player_external_id=100,
        secondary_player_external_id=None,
    )

    mocker.patch.object(
        match_events_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=RuntimeError("team missing"),
    )
    get_player_id = mocker.patch.object(
        match_events_service.players_service,
        "get_optional_player_id_from_external_id",
    )
    replace_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "replace_match_events_for_match",
    )
    invalidate_cache = mocker.patch.object(
        match_events_service.cache_service,
        "invalidate_cache",
    )

    with pytest.raises(RuntimeError, match="team missing"):
        match_events_service.update_match_events(db, 42, [row])

    get_player_id.assert_not_called()
    replace_events.assert_not_called()
    invalidate_cache.assert_not_called()


def test_update_match_events_does_not_replace_or_invalidate_when_player_lookup_fails(mocker):
    db = Mock()
    row = Mock(
        external_team_id=10,
        player_external_id=100,
        secondary_player_external_id=None,
    )

    mocker.patch.object(
        match_events_service.teams_service,
        "get_team_id_from_external_id",
        return_value=1,
    )
    mocker.patch.object(
        match_events_service.players_service,
        "get_optional_player_id_from_external_id",
        side_effect=RuntimeError("player lookup failed"),
    )
    replace_events = mocker.patch.object(
        match_events_service.match_events_repo,
        "replace_match_events_for_match",
    )
    invalidate_cache = mocker.patch.object(
        match_events_service.cache_service,
        "invalidate_cache",
    )

    with pytest.raises(RuntimeError, match="player lookup failed"):
        match_events_service.update_match_events(db, 42, [row])

    replace_events.assert_not_called()
    invalidate_cache.assert_not_called()
