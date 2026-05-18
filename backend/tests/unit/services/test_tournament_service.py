from unittest.mock import Mock

import pytest

from app.schemas.errors import NotFoundError
from app.api.v1.services import tournament as tournaments_service


def test_get_tournaments_returns_tournaments(mocker):
    db = Mock()
    fake_tournaments = [Mock()]

    get_all_tournaments = mocker.patch(
        'app.api.v1.services.tournament.tournaments_repo.get_all_tournaments',
        return_value=fake_tournaments,
    )

    result = tournaments_service.get_tournaments(db)

    assert result == fake_tournaments
    get_all_tournaments.assert_called_once_with(db)


def test_get_tournaments_raises_not_found_when_no_tournaments(mocker):
    db = Mock()

    mocker.patch(
        'app.services.tournament.tournaments_repo.get_all_tournaments',
        return_value=[],
    )

    with pytest.raises(NotFoundError, match='No tournaments found'):
        tournaments_service.get_tournaments(db)