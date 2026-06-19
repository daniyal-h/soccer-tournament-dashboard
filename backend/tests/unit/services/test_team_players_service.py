from datetime import date
from types import SimpleNamespace

import pytest

from app.api.v1.services import team_players as sut


def make_refresh_row(
    *,
    external_player_id=100,
    external_team_id=200,
    display_name="Lionel Messi",
    first_name="Lionel",
    last_name="Messi",
    date_of_birth=date(1987, 6, 24),
    photo_url="https://example.com/messi.png",
    nationality="Argentina",
    height=170,
    squad_number=10,
    position="FWD",
):
    return SimpleNamespace(
        external_player_id=external_player_id,
        external_team_id=external_team_id,
        display_name=display_name,
        first_name=first_name,
        last_name=last_name,
        date_of_birth=date_of_birth,
        photo_url=photo_url,
        nationality=nationality,
        height=height,
        squad_number=squad_number,
        position=position,
    )


def test_update_team_players_upserts_players_team_players_and_invalidates_cache(mocker):
    db = object()

    rows = [
        make_refresh_row(
            external_player_id=100,
            external_team_id=200,
            display_name="Lionel Messi",
            first_name="Lionel",
            last_name="Messi",
            squad_number=10,
            position="FWD",
        ),
        make_refresh_row(
            external_player_id=101,
            external_team_id=201,
            display_name="Emiliano Martinez",
            first_name="Emiliano",
            last_name="Martinez",
            date_of_birth=date(1992, 9, 2),
            photo_url=None,
            nationality="Argentina",
            height=195,
            squad_number=23,
            position="GK",
        ),
    ]

    upsert_players = mocker.patch("app.api.v1.services.team_players.players_repo.upsert_players")
    get_player_id = mocker.patch(
        "app.api.v1.services.team_players.players_service.get_player_id_from_external_id",
        side_effect=[1000, 1001],
    )
    get_team_id = mocker.patch(
        "app.api.v1.services.team_players.teams_service.get_team_id_from_external_id",
        side_effect=[2000, 2001],
    )
    upsert_team_players = mocker.patch(
        "app.api.v1.services.team_players.team_players_repo.upsert_team_players"
    )
    invalidate_cache = mocker.patch(
        "app.api.v1.services.team_players.cache_service.invalidate_cache"
    )

    sut.update_team_players(db, tournament_id=55, rows=rows)

    upsert_players.assert_called_once()
    player_rows = upsert_players.call_args.args[1]

    assert len(player_rows) == 2
    assert [(player.external_api_id, player.display_name) for player in player_rows] == [
        (100, "Lionel Messi"),
        (101, "Emiliano Martinez"),
    ]
    assert player_rows[0].first_name == "Lionel"
    assert player_rows[0].last_name == "Messi"
    assert player_rows[0].date_of_birth == date(1987, 6, 24)
    assert player_rows[0].photo_url == "https://example.com/messi.png"
    assert player_rows[0].nationality == "Argentina"
    assert player_rows[0].height == 170

    assert player_rows[1].first_name == "Emiliano"
    assert player_rows[1].last_name == "Martinez"
    assert player_rows[1].date_of_birth == date(1992, 9, 2)
    assert player_rows[1].photo_url is None
    assert player_rows[1].nationality == "Argentina"
    assert player_rows[1].height == 195

    assert get_player_id.call_args_list == [
        mocker.call(db, 100),
        mocker.call(db, 101),
    ]
    assert get_team_id.call_args_list == [
        mocker.call(db, 200),
        mocker.call(db, 201),
    ]

    upsert_team_players.assert_called_once()
    team_player_rows = upsert_team_players.call_args.args[1]

    assert len(team_player_rows) == 2
    assert [
        (
            row.tournament_id,
            row.team_id,
            row.player_id,
            row.squad_number,
            row.position,
        )
        for row in team_player_rows
    ] == [
        (55, 2000, 1000, 10, "FWD"),
        (55, 2001, 1001, 23, "GK"),
    ]

    invalidate_cache.assert_called_once_with(db, "team_squad:55")


def test_update_team_players_preserves_nullable_registration_fields(mocker):
    db = object()
    rows = [
        make_refresh_row(
            external_player_id=100,
            external_team_id=200,
            photo_url=None,
            height=None,
            squad_number=None,
            position=None,
        )
    ]

    mocker.patch("app.api.v1.services.team_players.players_repo.upsert_players")
    mocker.patch(
        "app.api.v1.services.team_players.players_service.get_player_id_from_external_id",
        return_value=1000,
    )
    mocker.patch(
        "app.api.v1.services.team_players.teams_service.get_team_id_from_external_id",
        return_value=2000,
    )
    upsert_team_players = mocker.patch(
        "app.api.v1.services.team_players.team_players_repo.upsert_team_players"
    )
    mocker.patch("app.api.v1.services.team_players.cache_service.invalidate_cache")

    sut.update_team_players(db, tournament_id=55, rows=rows)

    team_player_row = upsert_team_players.call_args.args[1][0]

    assert team_player_row.tournament_id == 55
    assert team_player_row.team_id == 2000
    assert team_player_row.player_id == 1000
    assert team_player_row.squad_number is None
    assert team_player_row.position is None


def test_update_team_players_handles_empty_rows_without_lookup_but_still_invalidates_cache(mocker):
    db = object()

    upsert_players = mocker.patch("app.api.v1.services.team_players.players_repo.upsert_players")
    get_player_id = mocker.patch(
        "app.api.v1.services.team_players.players_service.get_player_id_from_external_id"
    )
    get_team_id = mocker.patch(
        "app.api.v1.services.team_players.teams_service.get_team_id_from_external_id"
    )
    upsert_team_players = mocker.patch(
        "app.api.v1.services.team_players.team_players_repo.upsert_team_players"
    )
    invalidate_cache = mocker.patch(
        "app.api.v1.services.team_players.cache_service.invalidate_cache"
    )

    sut.update_team_players(db, tournament_id=55, rows=[])

    upsert_players.assert_called_once_with(db, [])
    get_player_id.assert_not_called()
    get_team_id.assert_not_called()
    upsert_team_players.assert_called_once_with(db, [])
    invalidate_cache.assert_called_once_with(db, "team_squad:55")


def test_update_team_players_does_not_upsert_team_players_if_player_lookup_fails(mocker):
    db = object()
    rows = [make_refresh_row(external_player_id=100, external_team_id=200)]

    mocker.patch("app.api.v1.services.team_players.players_repo.upsert_players")
    mocker.patch(
        "app.api.v1.services.team_players.players_service.get_player_id_from_external_id",
        side_effect=LookupError("player not found"),
    )
    get_team_id = mocker.patch(
        "app.api.v1.services.team_players.teams_service.get_team_id_from_external_id"
    )
    upsert_team_players = mocker.patch(
        "app.api.v1.services.team_players.team_players_repo.upsert_team_players"
    )
    invalidate_cache = mocker.patch(
        "app.api.v1.services.team_players.cache_service.invalidate_cache"
    )

    with pytest.raises(LookupError, match="player not found"):
        sut.update_team_players(db, tournament_id=55, rows=rows)

    get_team_id.assert_not_called()
    upsert_team_players.assert_not_called()
    invalidate_cache.assert_not_called()


def test_update_team_players_does_not_upsert_team_players_if_team_lookup_fails(mocker):
    db = object()
    rows = [make_refresh_row(external_player_id=100, external_team_id=200)]

    mocker.patch("app.api.v1.services.team_players.players_repo.upsert_players")
    mocker.patch(
        "app.api.v1.services.team_players.players_service.get_player_id_from_external_id",
        return_value=1000,
    )
    mocker.patch(
        "app.api.v1.services.team_players.teams_service.get_team_id_from_external_id",
        side_effect=LookupError("team not found"),
    )
    upsert_team_players = mocker.patch(
        "app.api.v1.services.team_players.team_players_repo.upsert_team_players"
    )
    invalidate_cache = mocker.patch(
        "app.api.v1.services.team_players.cache_service.invalidate_cache"
    )

    with pytest.raises(LookupError, match="team not found"):
        sut.update_team_players(db, tournament_id=55, rows=rows)

    upsert_team_players.assert_not_called()
    invalidate_cache.assert_not_called()


def test_update_team_players_does_not_invalidate_cache_if_team_player_upsert_fails(mocker):
    db = object()
    rows = [make_refresh_row(external_player_id=100, external_team_id=200)]

    mocker.patch("app.api.v1.services.team_players.players_repo.upsert_players")
    mocker.patch(
        "app.api.v1.services.team_players.players_service.get_player_id_from_external_id",
        return_value=1000,
    )
    mocker.patch(
        "app.api.v1.services.team_players.teams_service.get_team_id_from_external_id",
        return_value=2000,
    )
    mocker.patch(
        "app.api.v1.services.team_players.team_players_repo.upsert_team_players",
        side_effect=RuntimeError("upsert failed"),
    )
    invalidate_cache = mocker.patch(
        "app.api.v1.services.team_players.cache_service.invalidate_cache"
    )

    with pytest.raises(RuntimeError, match="upsert failed"):
        sut.update_team_players(db, tournament_id=55, rows=rows)

    invalidate_cache.assert_not_called()
