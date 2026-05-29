from unittest.mock import Mock

import pytest

from app.api.v1.services import tournaments as tournaments_service
from app.schemas.errors import NotFoundError


def test_get_tournaments_returns_tournaments(mocker):
    db = Mock()
    fake_tournaments = [Mock()]

    get_all_tournaments = mocker.patch(
        "app.api.v1.services.tournaments.tournaments_repo.get_all_tournaments",
        return_value=fake_tournaments,
    )

    result = tournaments_service.get_tournaments(db)

    assert result == fake_tournaments
    get_all_tournaments.assert_called_once_with(db)


def test_get_tournaments_raises_not_found_when_no_tournaments(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.tournaments.tournaments_repo.get_all_tournaments",
        return_value=[],
    )

    with pytest.raises(NotFoundError, match="^No tournaments found$"):
        tournaments_service.get_tournaments(db)


def test_get_tournaments_treats_none_as_not_found(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.tournaments.tournaments_repo.get_all_tournaments",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="^No tournaments found$"):
        tournaments_service.get_tournaments(db)


def test_get_tournament_returns_tournament(mocker):
    db = Mock()
    fake_tournament = Mock()

    get_tournament = mocker.patch(
        "app.api.v1.services.tournaments.tournaments_repo.get_tournament_by_id",
        return_value=fake_tournament,
    )

    result = tournaments_service.get_tournament(db, tournament_id=42)

    assert result == fake_tournament
    get_tournament.assert_called_once_with(db, 42)


def test_get_tournament_raises_not_found_when_missing(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.tournaments.tournaments_repo.get_tournament_by_id",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="^Tournament 42 was not found$"):
        tournaments_service.get_tournament(db, tournament_id=42)


def test_get_tournament_treats_falsy_result_as_not_found(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.tournaments.tournaments_repo.get_tournament_by_id",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="^Tournament 7 was not found$"):
        tournaments_service.get_tournament(db, tournament_id=7)
