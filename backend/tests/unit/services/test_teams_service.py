from unittest.mock import Mock

import pytest

from app.api.v1.services import teams as teams_service
from app.schemas.errors import NotFoundError


def test_get_team_id_returns_id_when_found(mocker):
    db = Mock()
    mock_team = Mock(id=42)

    mocker.patch(
        "app.api.v1.services.teams.teams_repo.get_team_from_external_id",
        return_value=mock_team,
    )

    result = teams_service.get_team_id_from_external_id(db, external_api_id=99)

    assert result == 42


def test_get_team_id_raises_not_found_when_missing(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.teams.teams_repo.get_team_from_external_id",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="99"):
        teams_service.get_team_id_from_external_id(db, external_api_id=99)


def test_get_team_id_calls_repo_with_correct_args(mocker):
    db = Mock()

    mock_get = mocker.patch(
        "app.api.v1.services.teams.teams_repo.get_team_from_external_id",
        return_value=Mock(id=1),
    )

    teams_service.get_team_id_from_external_id(db, external_api_id=99)

    mock_get.assert_called_once_with(db, 99)
