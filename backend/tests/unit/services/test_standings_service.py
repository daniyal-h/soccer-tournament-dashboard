from datetime import UTC, date, datetime
from unittest.mock import Mock

import pytest

from app.api.v1.services import standings as standings_service
from app.constants.cache_ttl import (
    STANDINGS_FINISHED_TOURNAMENT_TTL,
    STANDINGS_PRE_TOURNAMENT_SOON_TTL,
    STANDINGS_TTL,
)
from app.schemas.errors import NotFoundError


@pytest.fixture(autouse=True)
def mock_cache(mocker):
    mocker.patch("app.api.v1.services.standings.cache_service.get_cache", return_value=None)
    mocker.patch("app.api.v1.services.standings.cache_service.set_cache")
    mocker.patch("app.api.v1.services.standings.jsonable_encoder", side_effect=lambda x: x)
    mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=Mock(start_date=date(2022, 11, 20), end_date=date(2022, 12, 18)),
    )


def test_get_standings_rejects_invalid_tournament_id(client):
    response = client.get("/api/v1/tournaments/0/standings")

    assert response.status_code == 422


def test_get_standings_rejects_invalid_group(client):
    response = client.get("/api/v1/tournaments/1/standings?group=Z")
    assert response.status_code == 422

    response = client.get("/api/v1/tournaments/-1/standings?group=A")
    assert response.status_code == 422

    response = client.get("/api/v1/tournaments/1/standings?group=AZ")
    assert response.status_code == 422


def test_build_zero_state_standings_returns_zeroed_stats():
    tt1 = Mock(tournament_id=1, team_id=1, group="A", team=Mock())
    tt2 = Mock(tournament_id=1, team_id=2, group="A", team=Mock())

    result = standings_service.build_zero_state_standings([tt1, tt2])

    assert len(result) == 2

    assert result[0].tournament_id == 1
    assert result[0].team_id == 1
    assert result[0].group == "A"
    assert result[0].team == tt1.team

    assert result[1].tournament_id == 1
    assert result[1].team_id == 2
    assert result[1].group == "A"
    assert result[1].team == tt2.team

    assert all(row.points == 0 for row in result)
    assert all(row.goals_for == 0 for row in result)
    assert all(row.goals_against == 0 for row in result)
    assert all(row.wins == 0 for row in result)
    assert all(row.draws == 0 for row in result)
    assert all(row.losses == 0 for row in result)
    assert all(row.position == 0 for row in result)


def test_build_zero_state_standings_preserves_group_and_team():
    mock_team = Mock()
    tt = Mock(tournament_id=1, team_id=5, group="B", team=mock_team)

    result = standings_service.build_zero_state_standings([tt])

    assert result[0].group == "B"
    assert result[0].team_id == 5
    assert result[0].team is mock_team


def test_build_zero_state_standings_returns_empty_for_no_teams():
    result = standings_service.build_zero_state_standings([])
    assert result == []


def test_get_standings_calls_tournament_service_with_db_and_id(mocker):
    db = Mock()

    get_tournament = mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=Mock(start_date=date(2022, 11, 20), end_date=date(2022, 12, 18)),
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=0, goals_for=0, goals_against=0)],
    )

    standings_service.get_standings(db, tournament_id=7)

    get_tournament.assert_called_once_with(db, 7)


def test_get_standings_uses_tournament_teams_for_zero_state(mocker):
    db = Mock()
    tournament_team = Mock(tournament_id=7, team_id=3, group="A", team=Mock())

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[],
    )
    get_tournament_teams = mocker.patch(
        "app.api.v1.services.standings.tournament_teams_service.get_tournament_teams",
        return_value=[tournament_team],
    )

    result = standings_service.get_standings(db, tournament_id=7)

    get_tournament_teams.assert_called_once_with(db, 7)
    assert result["A"][0].tournament_id == 7
    assert result["A"][0].team_id == 3


def test_get_standings_returns_grouped_by_group(mocker):
    db = Mock()
    row_a1 = Mock(group="A", points=0, goals_for=0, goals_against=0)
    row_a2 = Mock(group="A", points=0, goals_for=0, goals_against=0)
    row_b1 = Mock(group="B", points=0, goals_for=0, goals_against=0)

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row_a1, row_a2, row_b1],
    )

    result = standings_service.get_standings(db, tournament_id=1)

    assert result == {"A": [row_a1, row_a2], "B": [row_b1]}


def test_get_standings_filters_by_group(mocker):
    db = Mock()
    row_a1 = Mock(group="A", points=0, goals_for=0, goals_against=0)
    row_b1 = Mock(group="B", points=0, goals_for=0, goals_against=0)

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row_a1, row_b1],
    )

    result = standings_service.get_standings(db, tournament_id=1, group="A")

    assert result == {"A": [row_a1]}


def test_get_standings_raises_not_found_for_missing_group(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=0, goals_for=0, goals_against=0)],
    )

    with pytest.raises(NotFoundError, match="Group Z not found"):
        standings_service.get_standings(db, tournament_id=1, group="Z")


def test_get_standings_raises_not_found_when_no_rows(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[],
    )
    mocker.patch(
        "app.api.v1.services.standings.tournament_teams_service.get_tournament_teams",
        side_effect=NotFoundError("No teams found in tournament"),
    )

    with pytest.raises(NotFoundError, match="No standings found for tournament 1"):
        standings_service.get_standings(db, tournament_id=1)


def test_get_standings_calls_repo_with_correct_args(mocker):
    db = Mock()

    get_all_standings = mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=0, goals_for=0, goals_against=0)],
    )

    standings_service.get_standings(db, tournament_id=42)

    get_all_standings.assert_called_once_with(db, 42)


def test_get_standings_sorts_by_goal_difference_not_total_goals(mocker):
    db = Mock()

    row1 = Mock(group="A", points=6, goals_for=5, goals_against=5)  # GD 0, total 10
    row2 = Mock(group="A", points=6, goals_for=3, goals_against=0)  # GD +3, total 3
    row3 = Mock(group="A", points=6, goals_for=2, goals_against=1)  # GD +1, total 3

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row1, row2, row3],
    )

    result = standings_service.get_standings(db, tournament_id=1)

    assert result["A"] == [row2, row3, row1]


def test_get_standings_sorts_by_points(mocker):
    db = Mock()
    row1 = Mock(group="A", points=6, goals_for=2, goals_against=0)
    row2 = Mock(group="A", points=9, goals_for=3, goals_against=0)
    row3 = Mock(group="A", points=3, goals_for=1, goals_against=0)

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row1, row2, row3],
    )

    result = standings_service.get_standings(db, tournament_id=1)
    assert result["A"] == [row2, row1, row3]


def test_get_standings_sorts_by_goal_difference_on_equal_points(mocker):
    db = Mock()
    row1 = Mock(group="A", points=6, goals_for=2, goals_against=2)  # GD 0
    row2 = Mock(group="A", points=6, goals_for=4, goals_against=1)  # GD +3
    row3 = Mock(group="A", points=6, goals_for=1, goals_against=3)  # GD -2

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row1, row2, row3],
    )

    result = standings_service.get_standings(db, tournament_id=1)
    assert result["A"] == [row2, row1, row3]


def test_get_standings_sorts_by_goals_for_on_equal_points_and_gd(mocker):
    db = Mock()
    row1 = Mock(group="A", points=6, goals_for=2, goals_against=0)  # GD +2, GF 2
    row2 = Mock(group="A", points=6, goals_for=4, goals_against=2)  # GD +2, GF 4
    row3 = Mock(group="A", points=6, goals_for=1, goals_against=-1)  # GD +2, GF 1

    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row1, row2, row3],
    )

    result = standings_service.get_standings(db, tournament_id=1)
    assert result["A"] == [row2, row1, row3]


def test_get_standings_returns_cached_result(mocker):
    db = Mock()
    cached_result = {"A": [{"points": 9}]}

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=cached_result,
    )
    mock_repo = mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
    )

    result = standings_service.get_standings(db, tournament_id=1)

    assert result == cached_result
    mock_repo.assert_not_called()


def test_get_standings_cache_hit_filters_requested_group(mocker):
    db = Mock()
    cached = {"A": [{"points": 9}], "B": [{"points": 3}]}

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=cached,
    )
    mock_repo = mocker.patch("app.api.v1.services.standings.standings_repo.get_all_standings")

    result = standings_service.get_standings(db, tournament_id=1, group="A")

    assert result == {"A": [{"points": 9}]}
    mock_repo.assert_not_called()


def test_get_standings_cache_hit_raises_for_missing_group(mocker):
    db = Mock()
    cached = {"A": [{"points": 9}]}

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=cached,
    )

    with pytest.raises(NotFoundError, match="Group Z not found"):
        standings_service.get_standings(db, tournament_id=1, group="Z")


def test_get_standings_uses_correct_cache_key(mocker):
    db = Mock()

    get_cache = mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value={"A": []},
    )

    standings_service.get_standings(db, tournament_id=42)

    get_cache.assert_called_once_with(db, "standings:42")


def test_get_standings_writes_expected_grouped_payload_to_cache(mocker):
    db = Mock()
    row_a = Mock(group="A", points=3, goals_for=2, goals_against=1)
    row_b = Mock(group="B", points=6, goals_for=4, goals_against=2)

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19)),
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[row_a, row_b],
    )
    mocker.patch(
        "app.api.v1.services.standings.jsonable_encoder",
        side_effect=lambda value: value,
    )
    set_cache = mocker.patch("app.api.v1.services.standings.cache_service.set_cache")

    standings_service.get_standings(db, tournament_id=7)

    args, kwargs = set_cache.call_args

    assert args[0] == db
    assert args[1] == "standings:7"
    assert kwargs["payload"] == {"A": [row_a], "B": [row_b]}
    assert kwargs["expires_at"] is not None


def test_get_standings_writes_to_cache_on_miss(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=None,
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.standings.cache_service.set_cache",
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=0, goals_for=0, goals_against=0)],
    )
    mocker.patch("app.api.v1.services.standings.jsonable_encoder", side_effect=lambda x: x)

    standings_service.get_standings(db, tournament_id=1)

    mock_set_cache.assert_called_once()


def test_get_standings_passes_has_rows_true_for_persisted_rows(mocker):
    db = Mock()
    tournament = Mock(start_date=date(2022, 11, 20), end_date=date(2022, 12, 18))

    mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=tournament,
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=3, goals_for=1, goals_against=0)],
    )

    get_ttl = mocker.patch(
        "app.api.v1.services.standings.get_standings_ttl",
        return_value=STANDINGS_TTL,
    )

    standings_service.get_standings(db, tournament_id=1)

    get_ttl.assert_called_once_with(tournament, has_rows=True)


def test_get_standings_passes_has_rows_false_for_zero_state(mocker):
    db = Mock()
    tournament = Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19))

    mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=tournament,
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[],
    )
    mocker.patch(
        "app.api.v1.services.standings.tournament_teams_service.get_tournament_teams",
        return_value=[Mock(tournament_id=1, team_id=1, group="A", team=Mock())],
    )

    get_ttl = mocker.patch(
        "app.api.v1.services.standings.get_standings_ttl",
        return_value=STANDINGS_PRE_TOURNAMENT_SOON_TTL,
    )

    standings_service.get_standings(db, tournament_id=1)

    get_ttl.assert_called_once_with(tournament, has_rows=False)


def test_get_standings_uses_finished_tournament_ttl(mocker):
    db = Mock()
    fixed_expires_at = datetime(2026, 1, 1, tzinfo=UTC)

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=None,
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.standings.cache_service.set_cache",
    )
    mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=Mock(start_date=date(2022, 11, 20), end_date=date(2022, 12, 18)),
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=3, goals_for=1, goals_against=0)],
    )
    mock_get_expires_at = mocker.patch(
        "app.api.v1.services.standings.get_expires_at",
        return_value=fixed_expires_at,
    )

    standings_service.get_standings(db, tournament_id=1)

    mock_get_expires_at.assert_called_once_with(STANDINGS_FINISHED_TOURNAMENT_TTL)

    _, kwargs = mock_set_cache.call_args
    assert kwargs["expires_at"] == fixed_expires_at


def test_get_standings_uses_pre_tournament_soon_ttl_for_zero_state(mocker):
    db = Mock()
    fixed_expires_at = datetime(2026, 6, 10, 12, 0, tzinfo=UTC)

    mocker.patch(
        "app.api.v1.services.standings.cache_service.get_cache",
        return_value=None,
    )
    mock_set_cache = mocker.patch(
        "app.api.v1.services.standings.cache_service.set_cache",
    )
    mocker.patch(
        "app.api.v1.services.standings.tournaments_service.get_tournament",
        return_value=Mock(start_date=date(2026, 6, 11), end_date=date(2026, 7, 19)),
    )
    mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[],
    )
    mocker.patch(
        "app.api.v1.services.standings.tournament_teams_service.get_tournament_teams",
        return_value=[Mock(tournament_id=1, team_id=1, group="A", team=Mock())],
    )
    mocker.patch("app.api.v1.services.standings.jsonable_encoder", side_effect=lambda x: x)

    mock_get_standings_ttl = mocker.patch(
        "app.api.v1.services.standings.get_standings_ttl",
        return_value=STANDINGS_PRE_TOURNAMENT_SOON_TTL,
    )
    mock_get_expires_at = mocker.patch(
        "app.api.v1.services.standings.get_expires_at",
        return_value=fixed_expires_at,
    )

    standings_service.get_standings(db, tournament_id=1)

    mock_get_standings_ttl.assert_called_once()
    _, kwargs = mock_get_standings_ttl.call_args
    assert kwargs["has_rows"] is False

    mock_get_expires_at.assert_called_once_with(STANDINGS_PRE_TOURNAMENT_SOON_TTL)

    _, kwargs = mock_set_cache.call_args
    assert kwargs["expires_at"] == fixed_expires_at


def test_update_standings_resolves_team_ids_and_calls_repo(mocker):
    db = Mock()

    mock_get_team_id = mocker.patch(
        "app.api.v1.services.standings.teams_service.get_team_id_from_external_id",
        return_value=10,
    )
    mock_repo = mocker.patch(
        "app.api.v1.services.standings.standings_repo.update_standings_in_tournament",
    )
    mocker.patch("app.api.v1.services.standings.cache_service.invalidate_cache")

    from app.schemas.standings import StandingRefreshRow

    data = [
        StandingRefreshRow(
            external_team_id=99,
            group="A",
            position=1,
            points=9,
            wins=3,
            draws=0,
            losses=0,
            goals_for=5,
            goals_against=1,
        )
    ]

    standings_service.update_standings(db, tournament_id=1, data=data)

    mock_get_team_id.assert_called_once_with(db, 99)
    mock_repo.assert_called_once()
    rows_passed = mock_repo.call_args[0][2]
    assert rows_passed[0].team_id == 10


def test_update_standings_calls_repo_with_db_tournament_and_rows(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.standings.teams_service.get_team_id_from_external_id",
        return_value=10,
    )
    update_repo = mocker.patch(
        "app.api.v1.services.standings.standings_repo.update_standings_in_tournament",
    )
    mocker.patch("app.api.v1.services.standings.cache_service.invalidate_cache")

    from app.schemas.standings import StandingRefreshRow

    data = [
        StandingRefreshRow(
            external_team_id=99,
            group="A",
            position=1,
            points=9,
            wins=3,
            draws=0,
            losses=0,
            goals_for=5,
            goals_against=1,
        )
    ]

    standings_service.update_standings(db, tournament_id=5, data=data)

    args = update_repo.call_args[0]

    assert args[0] == db
    assert args[1] == 5
    assert len(args[2]) == 1


def test_update_standings_builds_rows_with_all_fields(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.standings.teams_service.get_team_id_from_external_id",
        return_value=10,
    )
    update_repo = mocker.patch(
        "app.api.v1.services.standings.standings_repo.update_standings_in_tournament",
    )
    mocker.patch("app.api.v1.services.standings.cache_service.invalidate_cache")

    from app.schemas.standings import StandingRefreshRow

    data = [
        StandingRefreshRow(
            external_team_id=99,
            group="A",
            position=2,
            points=7,
            wins=2,
            draws=1,
            losses=0,
            goals_for=8,
            goals_against=3,
        )
    ]

    standings_service.update_standings(db, tournament_id=5, data=data)

    rows_passed = update_repo.call_args[0][2]
    row = rows_passed[0]

    assert row.tournament_id == 5
    assert row.team_id == 10
    assert row.group == "A"
    assert row.position == 2
    assert row.points == 7
    assert row.wins == 2
    assert row.draws == 1
    assert row.losses == 0
    assert row.goals_for == 8
    assert row.goals_against == 3


def test_update_standings_resolves_each_external_team_id(mocker):
    db = Mock()

    get_team_id = mocker.patch(
        "app.api.v1.services.standings.teams_service.get_team_id_from_external_id",
        side_effect=[10, 20],
    )
    update_repo = mocker.patch(
        "app.api.v1.services.standings.standings_repo.update_standings_in_tournament",
    )
    mocker.patch("app.api.v1.services.standings.cache_service.invalidate_cache")

    from app.schemas.standings import StandingRefreshRow

    data = [
        StandingRefreshRow(
            external_team_id=99,
            group="A",
            position=1,
            points=9,
            wins=3,
            draws=0,
            losses=0,
            goals_for=5,
            goals_against=1,
        ),
        StandingRefreshRow(
            external_team_id=88,
            group="B",
            position=2,
            points=4,
            wins=1,
            draws=1,
            losses=1,
            goals_for=2,
            goals_against=2,
        ),
    ]

    standings_service.update_standings(db, tournament_id=5, data=data)

    assert get_team_id.call_args_list == [
        mocker.call(db, 99),
        mocker.call(db, 88),
    ]

    rows_passed = update_repo.call_args[0][2]
    assert [row.team_id for row in rows_passed] == [10, 20]
    assert [row.group for row in rows_passed] == ["A", "B"]


def test_update_standings_invalidates_cache(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.standings.teams_service.get_team_id_from_external_id",
        return_value=10,
    )
    mocker.patch("app.api.v1.services.standings.standings_repo.update_standings_in_tournament")
    mock_invalidate = mocker.patch(
        "app.api.v1.services.standings.cache_service.invalidate_cache",
    )

    from app.schemas.standings import StandingRefreshRow

    data = [
        StandingRefreshRow(
            external_team_id=99,
            group="A",
            position=1,
            points=9,
            wins=3,
            draws=0,
            losses=0,
            goals_for=5,
            goals_against=1,
        )
    ]

    standings_service.update_standings(db, tournament_id=1, data=data)

    mock_invalidate.assert_called_once_with(db, "standings:1")
