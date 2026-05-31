from datetime import UTC, datetime, timedelta
from unittest.mock import Mock

from app.api.v1.services import matches as matches_service
from app.models.match import StatusType
from app.utils.cache_helper import MATCHES_LIVE_TTL


def make_match(match_id: int = 1, status: StatusType = StatusType.SCHEDULED) -> Mock:
    return Mock(
        id=match_id,
        status=status,
        kickoff_time=datetime(2026, 6, 11, 19, 0, tzinfo=UTC),
    )


def test_get_matches_returns_cached_matches_without_querying_dependencies(mocker):
    db = Mock()
    cached_matches = [{"id": 1}, {"id": 2}]

    mock_get_cache = mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=cached_matches,
    )
    mock_get_tournament = mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
    )
    mock_get_matches_by_tournament = mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.matches.cache_service.set_cache",
    )

    result = matches_service.get_matches(db, tournament_id=7)

    assert result == cached_matches

    mock_get_cache.assert_called_once_with(db, "matches:7")
    mock_get_tournament.assert_not_called()
    mock_get_matches_by_tournament.assert_not_called()
    mock_set_cache.assert_not_called()


def test_get_matches_validates_tournament_before_reading_matches_when_cache_misses(mocker):
    db = Mock()
    tournament = Mock()
    matches = [make_match(1)]

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mock_get_tournament = mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=tournament,
    )
    mock_get_matches_by_tournament = mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=matches,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
        return_value=MATCHES_LIVE_TTL,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
        return_value=datetime(2026, 6, 11, 19, 5, tzinfo=UTC),
    )
    mocker.patch(
        "app.api.v1.services.matches.jsonable_encoder",
        side_effect=lambda value: value,
    )
    mocker.patch("app.api.v1.services.matches.cache_service.set_cache")

    matches_service.get_matches(db, tournament_id=7)

    mock_get_tournament.assert_called_once_with(db, 7)
    mock_get_matches_by_tournament.assert_called_once_with(db, 7)


def test_get_matches_returns_database_rows_when_cache_misses(mocker):
    db = Mock()
    matches = [make_match(1), make_match(2)]

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=Mock(),
    )
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=matches,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
        return_value=MATCHES_LIVE_TTL,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
        return_value=datetime(2026, 6, 11, 19, 5, tzinfo=UTC),
    )
    mocker.patch(
        "app.api.v1.services.matches.jsonable_encoder",
        side_effect=lambda value: value,
    )
    mocker.patch("app.api.v1.services.matches.cache_service.set_cache")

    result = matches_service.get_matches(db, tournament_id=7)

    assert result == matches


def test_get_matches_writes_encoded_matches_to_cache_when_cache_misses(mocker):
    db = Mock()
    expires_at = datetime(2026, 6, 11, 19, 5, tzinfo=UTC)
    matches = [make_match(1), make_match(2)]
    encoded_matches = [{"id": 1}, {"id": 2}]

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=Mock(),
    )
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=matches,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
        return_value=MATCHES_LIVE_TTL,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
        return_value=expires_at,
    )
    mock_jsonable_encoder = mocker.patch(
        "app.api.v1.services.matches.jsonable_encoder",
        return_value=encoded_matches,
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.matches.cache_service.set_cache",
    )

    matches_service.get_matches(db, tournament_id=7)

    mock_jsonable_encoder.assert_called_once_with(matches)
    mock_set_cache.assert_called_once_with(
        db,
        "matches:7",
        payload=encoded_matches,
        expires_at=expires_at,
    )


def test_get_matches_uses_ttl_based_on_tournament_and_matches(mocker):
    db = Mock()
    tournament = Mock()
    matches = [make_match(1)]
    expires_at = datetime(2026, 6, 11, 19, 5, tzinfo=UTC)

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=tournament,
    )
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=matches,
    )
    mock_get_matches_ttl = mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
        return_value=MATCHES_LIVE_TTL,
    )
    mock_get_expires_at = mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
        return_value=expires_at,
    )
    mocker.patch(
        "app.api.v1.services.matches.jsonable_encoder",
        side_effect=lambda value: value,
    )
    mocker.patch("app.api.v1.services.matches.cache_service.set_cache")

    matches_service.get_matches(db, tournament_id=7)

    mock_get_matches_ttl.assert_called_once_with(tournament, matches)
    mock_get_expires_at.assert_called_once_with(MATCHES_LIVE_TTL)


def test_get_matches_caches_empty_match_list_after_validating_tournament(mocker):
    db = Mock()
    tournament = Mock()
    expires_at = datetime(2026, 6, 11, 19, 5, tzinfo=UTC)

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mock_get_tournament = mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=tournament,
    )
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=[],
    )
    mock_get_matches_ttl = mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
        return_value=timedelta(hours=1),
    )
    mock_get_expires_at = mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
        return_value=expires_at,
    )
    mock_jsonable_encoder = mocker.patch(
        "app.api.v1.services.matches.jsonable_encoder",
        return_value=[],
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.matches.cache_service.set_cache",
    )

    result = matches_service.get_matches(db, tournament_id=7)

    assert result == []

    mock_get_tournament.assert_called_once_with(db, 7)
    mock_get_matches_ttl.assert_called_once_with(tournament, [])
    mock_get_expires_at.assert_called_once_with(timedelta(hours=1))
    mock_jsonable_encoder.assert_called_once_with([])
    mock_set_cache.assert_called_once_with(
        db,
        "matches:7",
        payload=[],
        expires_at=expires_at,
    )


def test_get_matches_does_not_cache_when_tournament_validation_fails(mocker):
    db = Mock()
    expected_error = RuntimeError("tournament missing")

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        side_effect=expected_error,
    )
    mock_get_matches_by_tournament = mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
    )
    mock_get_matches_ttl = mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
    )
    mock_get_expires_at = mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.matches.cache_service.set_cache",
    )

    try:
        matches_service.get_matches(db, tournament_id=404)
    except RuntimeError as exc:
        assert exc is expected_error

    mock_get_matches_by_tournament.assert_not_called()
    mock_get_matches_ttl.assert_not_called()
    mock_get_expires_at.assert_not_called()
    mock_set_cache.assert_not_called()


def test_get_matches_does_not_cache_when_match_query_fails(mocker):
    db = Mock()
    expected_error = RuntimeError("database exploded")

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=Mock(),
    )
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        side_effect=expected_error,
    )
    mock_get_matches_ttl = mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
    )
    mock_get_expires_at = mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.matches.cache_service.set_cache",
    )

    try:
        matches_service.get_matches(db, tournament_id=7)
    except RuntimeError as exc:
        assert exc is expected_error

    mock_get_matches_ttl.assert_not_called()
    mock_get_expires_at.assert_not_called()
    mock_set_cache.assert_not_called()


def test_get_matches_allows_empty_cached_list_to_refresh_instead_of_returning_it(mocker):
    db = Mock()
    matches = [make_match(1)]

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=[],
    )
    mock_get_tournament = mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        return_value=Mock(),
    )
    mock_get_matches_by_tournament = mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=matches,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_matches_ttl",
        return_value=MATCHES_LIVE_TTL,
    )
    mocker.patch(
        "app.api.v1.services.matches.get_expires_at",
        return_value=datetime(2026, 6, 11, 19, 5, tzinfo=UTC),
    )
    mocker.patch(
        "app.api.v1.services.matches.jsonable_encoder",
        side_effect=lambda value: value,
    )
    mocker.patch("app.api.v1.services.matches.cache_service.set_cache")

    result = matches_service.get_matches(db, tournament_id=7)

    assert result == matches
    mock_get_tournament.assert_called_once_with(db, 7)
    mock_get_matches_by_tournament.assert_called_once_with(db, 7)
