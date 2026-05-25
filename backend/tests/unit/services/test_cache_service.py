import json
from datetime import UTC, datetime, timedelta
from unittest.mock import Mock

from app.api.v1.services import cache as cache_service
from app.models.cache_entry import CacheEntry


def make_entry(expires_at: datetime, payload: dict) -> CacheEntry:
    entry = Mock(spec=CacheEntry)
    entry.expires_at = expires_at
    entry.payload = json.dumps(payload)
    return entry


def test_get_cache_calls_repo_with_db_and_key(mocker):
    db = mocker.Mock()
    payload = {"hello": "world"}

    entry = make_entry(
        expires_at=datetime.now(UTC) + timedelta(minutes=5),
        payload=payload,
    )

    get_cache_entry_mock = mocker.patch(
        "app.api.v1.services.cache.cache_repo.get_cache_entry",
        return_value=entry,
    )

    result = cache_service.get_cache(db, "standings:1")

    assert result == payload
    get_cache_entry_mock.assert_called_once_with(db, "standings:1")


def test_get_cache_returns_none_when_not_found(mocker):
    db = Mock()
    mocker.patch(
        "app.api.v1.services.cache.cache_repo.get_cache_entry",
        return_value=None,
    )

    result = cache_service.get_cache(db, "standings:1")

    assert result is None


def test_get_cache_returns_none_when_expired(mocker):
    db = Mock()
    expired_entry = make_entry(
        expires_at=datetime.now(UTC) - timedelta(minutes=1),
        payload={"A": []},
    )
    mocker.patch(
        "app.api.v1.services.cache.cache_repo.get_cache_entry",
        return_value=expired_entry,
    )

    result = cache_service.get_cache(db, "standings:1")

    assert result is None


def test_get_cache_returns_payload_when_expiry_equals_now(mocker):
    db = Mock()
    now = datetime.now(UTC)
    payload = {"A": []}

    entry = make_entry(
        expires_at=now,
        payload=payload,
    )

    mocker.patch(
        "app.api.v1.services.cache.cache_repo.get_cache_entry",
        return_value=entry,
    )

    datetime_mock = mocker.patch("app.api.v1.services.cache.datetime")
    datetime_mock.now.return_value = now

    result = cache_service.get_cache(db, "standings:1")

    assert result == payload


def test_get_cache_returns_deserialized_payload_when_valid(mocker):
    db = Mock()
    payload = {"A": [{"points": 9}]}
    valid_entry = make_entry(
        expires_at=datetime.now(UTC) + timedelta(minutes=5),
        payload=payload,
    )
    mocker.patch(
        "app.api.v1.services.cache.cache_repo.get_cache_entry",
        return_value=valid_entry,
    )

    result = cache_service.get_cache(db, "standings:1")

    assert result == payload


def test_set_cache_serializes_and_calls_repo(mocker):
    db = Mock()
    mock_set = mocker.patch("app.api.v1.services.cache.cache_repo.set_cache_entry")
    expires_at = datetime.now(UTC) + timedelta(minutes=5)
    payload = {"A": [{"points": 9}]}

    cache_service.set_cache(db, "standings:1", payload, expires_at)

    mock_set.assert_called_once_with(db, "standings:1", json.dumps(payload), expires_at)


def test_invalidate_cache_calls_repo(mocker):
    db = Mock()
    mock_invalidate = mocker.patch("app.api.v1.services.cache.cache_repo.invalidate_cache_entry")

    cache_service.invalidate_cache(db, "standings:1")

    mock_invalidate.assert_called_once_with(db, "standings:1")
