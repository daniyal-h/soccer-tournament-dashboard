from datetime import UTC, datetime, timedelta, timezone
from unittest.mock import Mock

import pytest

from app.api.v1.services import matches as matches_service
from app.models.enums import StatusType
from app.models.match import Match, StageType
from app.schemas.errors import NotFoundError
from app.schemas.matches import MatchRefreshRow
from app.utils.cache_helper import MATCHES_LIVE_TTL


def make_match(match_id: int = 1, status: StatusType = StatusType.SCHEDULED) -> Mock:
    return Mock(
        id=match_id,
        status=status,
        kickoff_time=datetime(2026, 6, 11, 19, 0, tzinfo=UTC),
    )


def test_get_match_returns_match_when_found(mocker):
    db = Mock()
    match = Mock()

    get_match_by_id = mocker.patch.object(
        matches_service.matches_repo,
        "get_match_by_id",
        return_value=match,
    )

    result = matches_service.get_match(db, 42)

    assert result is match
    get_match_by_id.assert_called_once_with(db, 42)


def test_get_match_raises_not_found_when_match_does_not_exist(mocker):
    db = Mock()

    get_match_by_id = mocker.patch.object(
        matches_service.matches_repo,
        "get_match_by_id",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="Match 42 was not found"):
        matches_service.get_match(db, 42)

    get_match_by_id.assert_called_once_with(db, 42)


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


def test_get_matches_returns_empty_cached_list_without_refreshing(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.matches.cache_service.get_cache",
        return_value=[],
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

    assert result == []
    mock_get_tournament.assert_not_called()
    mock_get_matches_by_tournament.assert_not_called()
    mock_set_cache.assert_not_called()


def test_get_matches_returns_cached_matches_with_penalties(mocker):
    db = Mock()
    cached_matches = [
        {
            "id": 1,
            "team_a_score": 2,
            "team_b_score": 2,
            "team_a_penalties": 3,
            "team_b_penalties": 4,
        }
    ]

    mocker.patch.object(matches_service.cache_service, "get_cache", return_value=cached_matches)
    get_tournament = mocker.patch.object(matches_service.tournaments_service, "get_tournament")
    get_repo_matches = mocker.patch.object(
        matches_service.matches_repo, "get_matches_by_tournament"
    )
    set_cache = mocker.patch.object(matches_service.cache_service, "set_cache")

    result = matches_service.get_matches(db, 1)

    assert result == cached_matches
    get_tournament.assert_not_called()
    get_repo_matches.assert_not_called()
    set_cache.assert_not_called()


def test_get_matches_caches_database_matches_with_penalties(mocker):
    db = Mock()
    tournament = Mock()

    match = Match(
        external_api_id=9001,
        tournament_id=1,
        team_a_id=101,
        team_b_id=202,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=StageType.THIRD_PLACE,
        group=None,
        status=StatusType.FINISHED,
        venue="Bank of America Stadium",
        city="Charlotte",
        elapsed=120,
        team_a_score=2,
        team_b_score=2,
        team_a_penalties=3,
        team_b_penalties=4,
    )

    mocker.patch.object(matches_service.cache_service, "get_cache", return_value=None)
    mocker.patch.object(
        matches_service.tournaments_service, "get_tournament", return_value=tournament
    )
    mocker.patch.object(
        matches_service.matches_repo, "get_matches_by_tournament", return_value=[match]
    )
    mocker.patch.object(matches_service, "get_matches_ttl", return_value=300)
    mocker.patch.object(matches_service, "get_expires_at", return_value="expires-at")
    set_cache = mocker.patch.object(matches_service.cache_service, "set_cache")

    result = matches_service.get_matches(db, 1)

    assert result == [match]

    payload = set_cache.call_args.kwargs["payload"]
    assert payload[0]["team_a_score"] == 2
    assert payload[0]["team_b_score"] == 2
    assert payload[0]["team_a_penalties"] == 3
    assert payload[0]["team_b_penalties"] == 4


def test_get_live_matches_fetches_live_matches_using_current_utc_time(mocker):
    db = Mock()
    live_matches = [make_match(1, StatusType.LIVE)]

    get_all_live_matches = mocker.patch.object(
        matches_service.matches_repo,
        "get_all_live_matches",
        return_value=live_matches,
    )

    result = matches_service.get_live_matches(db)

    assert result is live_matches

    get_all_live_matches.assert_called_once()
    assert get_all_live_matches.call_args.args[0] is db

    passed_now = get_all_live_matches.call_args.args[1]
    assert isinstance(passed_now, datetime)
    assert passed_now.tzinfo is not None
    assert passed_now.utcoffset() == timedelta(0)


def make_row(
    *,
    external_api_id: int = 100,
    external_team_a_id: int = 10,
    external_team_b_id: int = 20,
    stage: StageType = StageType.GROUP,
) -> MatchRefreshRow:
    return MatchRefreshRow(
        external_api_id=external_api_id,
        external_team_a_id=external_team_a_id,
        external_team_b_id=external_team_b_id,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=stage,
        status=StatusType.SCHEDULED,
        venue="BC Place",
        city="Vancouver",
        elapsed=None,
        team_a_score=None,
        team_b_score=None,
    )


def test_update_matches_builds_group_match_rows_and_invalidates_cache(mocker):
    db = Mock()
    tournament_id = 1

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    invalidate_cache = mocker.patch.object(matches_service.cache_service, "invalidate_cache")

    get_team_id = mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    get_team_group = mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "A"],
    )

    matches_service.update_matches(db, tournament_id, [make_row()])

    assert get_team_id.call_args_list == [
        mocker.call(db, 10),
        mocker.call(db, 20),
    ]

    assert get_team_group.call_args_list == [
        mocker.call(db, tournament_id=tournament_id, team_id=101),
        mocker.call(db, tournament_id=tournament_id, team_id=202),
    ]

    upsert.assert_called_once()
    assert upsert.call_args.args[0] is db
    assert upsert.call_args.args[1] == tournament_id

    rows = upsert.call_args.args[2]
    assert len(rows) == 1

    match = rows[0]
    assert match.external_api_id == 100
    assert match.tournament_id == tournament_id
    assert match.team_a_id == 101
    assert match.team_b_id == 202
    assert match.stage == StageType.GROUP
    assert match.group == "A"
    assert match.status == StatusType.SCHEDULED
    assert match.venue == "BC Place"
    assert match.city == "Vancouver"
    assert match.elapsed is None
    assert match.team_a_score is None
    assert match.team_b_score is None
    assert match.kickoff_time == datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc)

    invalidate_cache.assert_called_once_with(db, "matches:1")


def test_update_matches_keeps_group_none_when_group_match_teams_do_not_match(mocker):
    db = Mock()

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "B"],
    )

    matches_service.update_matches(db, 1, [make_row()])

    rows = upsert.call_args.args[2]
    assert rows[0].group is None


def test_update_matches_keeps_group_none_when_one_group_is_missing(mocker):
    db = Mock()

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=[None, "A"],
    )

    matches_service.update_matches(db, 1, [make_row()])

    rows = upsert.call_args.args[2]
    assert rows[0].group is None


def test_update_matches_does_not_resolve_group_for_knockout_match(mocker):
    db = Mock()

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    get_team_group = mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
    )

    matches_service.update_matches(
        db,
        1,
        [make_row(stage=StageType.ROUND_OF_16)],
    )

    get_team_group.assert_not_called()

    rows = upsert.call_args.args[2]
    assert rows[0].group is None
    assert rows[0].stage == StageType.ROUND_OF_16


def test_update_matches_passes_all_rows_to_upsert_in_order(mocker):
    db = Mock()

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202, 303, 404],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "A", "B", "B"],
    )

    matches_service.update_matches(
        db,
        1,
        [
            make_row(external_api_id=100, external_team_a_id=10, external_team_b_id=20),
            make_row(external_api_id=200, external_team_a_id=30, external_team_b_id=40),
        ],
    )

    rows = upsert.call_args.args[2]
    assert [row.external_api_id for row in rows] == [100, 200]
    assert [(row.team_a_id, row.team_b_id) for row in rows] == [(101, 202), (303, 404)]
    assert [row.group for row in rows] == ["A", "B"]


def test_update_matches_handles_empty_data_and_invalidates_cache(mocker):
    db = Mock()
    tournament_id = 1

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    invalidate_cache = mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    get_team_id = mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
    )
    get_team_group = mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
    )

    matches_service.update_matches(db, tournament_id, [])

    get_team_id.assert_not_called()
    get_team_group.assert_not_called()
    upsert.assert_called_once_with(db, tournament_id, [])
    invalidate_cache.assert_called_once_with(db, "matches:1")


def test_update_matches_reraises_when_team_resolution_fails(mocker):
    db = Mock()
    error = RuntimeError("team not found")

    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=error,
    )
    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    invalidate_cache = mocker.patch.object(matches_service.cache_service, "invalidate_cache")

    with pytest.raises(RuntimeError, match="team not found"):
        matches_service.update_matches(db, 1, [make_row()])

    upsert.assert_not_called()
    invalidate_cache.assert_not_called()


def test_update_matches_reraises_when_upsert_fails(mocker):
    db = Mock()

    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "A"],
    )
    mocker.patch.object(
        matches_service.matches_repo,
        "upsert_matches_in_tournament",
        side_effect=RuntimeError("upsert failed"),
    )
    invalidate_cache = mocker.patch.object(matches_service.cache_service, "invalidate_cache")

    with pytest.raises(RuntimeError, match="upsert failed"):
        matches_service.update_matches(db, 1, [make_row()])

    invalidate_cache.assert_not_called()


def test_update_matches_preserves_penalty_scores(mocker):
    db = Mock()
    tournament_id = 1

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "A"],
    )

    row = make_row()
    row.team_a_score = 2
    row.team_b_score = 2
    row.team_a_penalties = 3
    row.team_b_penalties = 4

    matches_service.update_matches(db, tournament_id, [row])

    saved_rows = upsert.call_args.args[2]
    assert len(saved_rows) == 1

    match = saved_rows[0]
    assert match.team_a_score == 2
    assert match.team_b_score == 2
    assert match.team_a_penalties == 3
    assert match.team_b_penalties == 4


def test_update_matches_keeps_penalties_none_when_match_has_no_penalty_shootout(mocker):
    db = Mock()
    tournament_id = 1

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "A"],
    )

    row = make_row()
    row.team_a_score = 1
    row.team_b_score = 0
    row.team_a_penalties = None
    row.team_b_penalties = None

    matches_service.update_matches(db, tournament_id, [row])

    match = upsert.call_args.args[2][0]

    assert match.team_a_score == 1
    assert match.team_b_score == 0
    assert match.team_a_penalties is None
    assert match.team_b_penalties is None


def test_update_matches_preserves_kickoff_time_and_elapsed(mocker):
    db = Mock()
    tournament_id = 1

    kickoff_time = datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc)

    upsert = mocker.patch.object(matches_service.matches_repo, "upsert_matches_in_tournament")
    mocker.patch.object(matches_service.cache_service, "invalidate_cache")
    mocker.patch.object(
        matches_service.teams_service,
        "get_team_id_from_external_id",
        side_effect=[101, 202],
    )
    mocker.patch.object(
        matches_service.tournament_teams_service,
        "get_team_group",
        side_effect=["A", "A"],
    )

    row = make_row()
    row.kickoff_time = kickoff_time
    row.elapsed = 67

    matches_service.update_matches(db, tournament_id, [row])

    match = upsert.call_args.args[2][0]

    assert match.kickoff_time == kickoff_time
    assert match.elapsed == 67
