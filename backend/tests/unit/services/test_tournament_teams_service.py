from unittest.mock import Mock

import pytest

from app.api.v1.services import tournament_teams as tournament_teams_service
from app.schemas.errors import NotFoundError


def test_get_tournament_teams_returns_rows(mocker):
    db = Mock()
    mock_rows = [Mock(), Mock()]

    mocker.patch(
        "app.api.v1.services.tournament_teams.tournament_teams_repo.get_teams_in_tournament",
        return_value=mock_rows,
    )

    result = tournament_teams_service.get_tournament_teams(db, tournament_id=1)
    assert result == mock_rows


def test_get_tournament_teams_raises_not_found_when_empty(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.tournament_teams.tournament_teams_repo.get_teams_in_tournament",
        return_value=[],
    )

    with pytest.raises(NotFoundError):
        tournament_teams_service.get_tournament_teams(db, tournament_id=1)


def test_get_tournament_teams_calls_repo_with_correct_args(mocker):
    db = Mock()

    get_teams = mocker.patch(
        "app.api.v1.services.tournament_teams.tournament_teams_repo.get_teams_in_tournament",
        return_value=[Mock()],
    )

    tournament_teams_service.get_tournament_teams(db, tournament_id=42)
    get_teams.assert_called_once_with(db, 42)
