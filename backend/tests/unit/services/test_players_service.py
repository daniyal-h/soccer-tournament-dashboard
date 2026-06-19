from unittest.mock import Mock

import pytest

from app.api.v1.services import players as players_service
from app.schemas.errors import NotFoundError


def test_get_optional_player_id_from_external_id_returns_none_for_missing_external_id(mocker):
    db = Mock()
    get_player = mocker.patch.object(
        players_service.players_repo,
        "get_player_from_external_id",
    )

    result = players_service.get_optional_player_id_from_external_id(db, None)

    assert result is None
    get_player.assert_not_called()


def test_get_optional_player_id_from_external_id_returns_none_when_player_not_found(mocker):
    db = Mock()

    get_player = mocker.patch.object(
        players_service.players_repo,
        "get_player_from_external_id",
        return_value=None,
    )

    result = players_service.get_optional_player_id_from_external_id(db, 9001)

    assert result is None
    get_player.assert_called_once_with(db, 9001)


def test_get_optional_player_id_from_external_id_returns_player_id_when_found(mocker):
    db = Mock()
    player = Mock(id=42)

    get_player = mocker.patch.object(
        players_service.players_repo,
        "get_player_from_external_id",
        return_value=player,
    )

    result = players_service.get_optional_player_id_from_external_id(db, 9001)

    assert result == 42
    get_player.assert_called_once_with(db, 9001)


def test_get_player_id_from_external_id_returns_player_id_when_found(mocker):
    db = Mock()
    player = Mock(id=42)

    get_player = mocker.patch.object(
        players_service.players_repo,
        "get_player_from_external_id",
        return_value=player,
    )

    result = players_service.get_player_id_from_external_id(db, 9001)

    assert result == 42
    get_player.assert_called_once_with(db, 9001)


def test_get_player_id_from_external_id_raises_not_found_when_player_missing(mocker):
    db = Mock()

    get_player = mocker.patch.object(
        players_service.players_repo,
        "get_player_from_external_id",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="Player with external id 9001 not found"):
        players_service.get_player_id_from_external_id(db, 9001)

    get_player.assert_called_once_with(db, 9001)
