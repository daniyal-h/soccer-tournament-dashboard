from unittest.mock import Mock

from app.api.v1.services import matches as matches_service
from app.models.match import Match


def test_get_matches_validates_tournament_exists(mocker):
    db = Mock()
    tournament_id = 1

    validate_mock = mocker.patch("app.api.v1.services.matches.tournaments_service.get_tournament")
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=[],
    )

    matches_service.get_matches(db, tournament_id)

    validate_mock.assert_called_once_with(db, tournament_id)


def test_get_matches_returns_matches_for_tournament(mocker):
    db = Mock()
    tournament_id = 1
    expected_matches = [Mock(spec=Match), Mock(spec=Match)]

    mocker.patch("app.api.v1.services.matches.tournaments_service.get_tournament")
    repo_mock = mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=expected_matches,
    )

    result = matches_service.get_matches(db, tournament_id)

    assert result == expected_matches
    repo_mock.assert_called_once_with(db, tournament_id)


def test_get_matches_returns_empty_list_when_tournament_has_no_matches(mocker):
    db = Mock()
    tournament_id = 1

    mocker.patch("app.api.v1.services.matches.tournaments_service.get_tournament")
    mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
        return_value=[],
    )

    result = matches_service.get_matches(db, tournament_id)

    assert result == []


def test_get_matches_does_not_query_matches_if_tournament_validation_fails(mocker):
    db = Mock()
    tournament_id = 999

    mocker.patch(
        "app.api.v1.services.matches.tournaments_service.get_tournament",
        side_effect=Exception("Tournament not found"),
    )
    repo_mock = mocker.patch(
        "app.api.v1.services.matches.matches_repo.get_matches_by_tournament",
    )

    try:
        matches_service.get_matches(db, tournament_id)
    except Exception:
        pass

    repo_mock.assert_not_called()
