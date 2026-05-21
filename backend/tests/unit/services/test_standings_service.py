from unittest.mock import Mock

import pytest

from app.api.v1.services import standings as standings_service
from app.schemas.errors import NotFoundError


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

    with pytest.raises(NotFoundError):
        standings_service.get_standings(db, tournament_id=1)


def test_get_standings_calls_repo_with_correct_args(mocker):
    db = Mock()

    get_all_standings = mocker.patch(
        "app.api.v1.services.standings.standings_repo.get_all_standings",
        return_value=[Mock(group="A", points=0, goals_for=0, goals_against=0)],
    )

    standings_service.get_standings(db, tournament_id=42)

    get_all_standings.assert_called_once_with(db, 42)


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
