from datetime import date, timedelta
from decimal import Decimal
from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api.v1.services import player_leaderboards as player_leaderboards_service
from app.models.enums import LeaderboardType


def category(value: str) -> LeaderboardType:
    return next(item for item in LeaderboardType if item.value == value)


def make_leaderboard_row(
    *,
    rank: int = 1,
    value: int = 8,
    appearances: int | None = 7,
    minutes_played: int | None = 597,
    rating: Decimal | None = Decimal("7.61"),
):
    return SimpleNamespace(
        rank=rank,
        value=value,
        appearances=appearances,
        minutes_played=minutes_played,
        rating=rating,
        player=SimpleNamespace(
            id=1539,
            display_name="Kylian Mbappé",
            photo_url="https://media.api-sports.io/football/players/278.png",
        ),
        team=SimpleNamespace(
            id=2,
            name="France",
            short_name="FRA",
            logo_url="https://media.api-sports.io/football/teams/2.png",
        ),
    )


def make_tournament():
    return SimpleNamespace(
        id=1,
        external_api_id=1,
        season="2022",
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )


def test_get_player_leaderboard_returns_cached_response_without_db_fetch(mocker):
    db = mocker.Mock()
    selected_category = category("goals")

    cached_payload = {
        "category": "goals",
        "data": [
            {
                "rank": 1,
                "value": 8,
                "player": {
                    "id": 1539,
                    "display_name": "Kylian Mbappé",
                    "photo_url": "https://media.api-sports.io/football/players/278.png",
                },
                "team": {
                    "id": 2,
                    "name": "France",
                    "short_name": "FRA",
                    "logo_url": "https://media.api-sports.io/football/teams/2.png",
                },
                "appearances": 7,
                "minutes_played": 597,
                "rating": "7.61",
            }
        ],
    }

    get_cache = mocker.patch.object(
        player_leaderboards_service.cache_service,
        "get_cache",
        return_value=cached_payload,
    )
    get_tournament = mocker.patch.object(
        player_leaderboards_service.tournaments_service,
        "get_tournament",
    )
    repo_get = mocker.patch.object(
        player_leaderboards_service.player_leaderboards_repo,
        "get_tournament_leaderboard_by_category",
    )
    set_cache = mocker.patch.object(
        player_leaderboards_service.cache_service,
        "set_cache",
    )

    result = player_leaderboards_service.get_player_leaderboard(
        db,
        tournament_id=1,
        category=selected_category,
    )

    get_cache.assert_called_once_with(db, "player_leaderboards:1:goals")
    get_tournament.assert_not_called()
    repo_get.assert_not_called()
    set_cache.assert_not_called()

    assert result.category == selected_category
    assert len(result.data) == 1
    assert result.data[0].rank == 1
    assert result.data[0].value == 8
    assert result.data[0].player.display_name == "Kylian Mbappé"
    assert result.data[0].team.short_name == "FRA"
    assert result.data[0].minutes_played == 597
    assert result.data[0].rating == 7.61


def test_get_player_leaderboard_fetches_wraps_and_caches_when_cache_missing(mocker):
    db = mocker.Mock()
    selected_category = category("goals")
    tournament = make_tournament()
    row = make_leaderboard_row()
    ttl = timedelta(minutes=15)
    expires_at = date(2026, 6, 21)

    mocker.patch.object(
        player_leaderboards_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        player_leaderboards_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    repo_get = mocker.patch.object(
        player_leaderboards_service.player_leaderboards_repo,
        "get_tournament_leaderboard_by_category",
        return_value=[row],
    )
    get_ttl = mocker.patch.object(
        player_leaderboards_service,
        "get_tournament_data_ttl",
        return_value=ttl,
    )
    get_expires_at = mocker.patch.object(
        player_leaderboards_service,
        "get_expires_at",
        return_value=expires_at,
    )
    set_cache = mocker.patch.object(
        player_leaderboards_service.cache_service,
        "set_cache",
    )

    result = player_leaderboards_service.get_player_leaderboard(
        db,
        tournament_id=1,
        category=selected_category,
    )

    get_tournament.assert_called_once_with(db, 1)
    repo_get.assert_called_once_with(db, 1, selected_category)
    get_ttl.assert_called_once_with(tournament)
    get_expires_at.assert_called_once_with(ttl)

    assert result.category == selected_category
    assert len(result.data) == 1
    assert result.data[0].player.id == 1539
    assert result.data[0].team.name == "France"
    assert result.data[0].appearances == 7
    assert result.data[0].minutes_played == 597
    assert result.data[0].rating == 7.61

    set_cache.assert_called_once()
    args, kwargs = set_cache.call_args

    assert args[0] is db
    assert args[1] == "player_leaderboards:1:goals"
    assert kwargs["expires_at"] == expires_at

    payload = kwargs["payload"]
    assert payload["category"] == "goals"
    assert payload["data"][0]["rank"] == 1
    assert payload["data"][0]["value"] == 8
    assert payload["data"][0]["player"]["display_name"] == "Kylian Mbappé"
    assert payload["data"][0]["team"]["short_name"] == "FRA"
    assert payload["data"][0]["minutes_played"] == 597


def test_get_player_leaderboard_uses_category_value_in_cache_key_and_repo_query(mocker):
    db = mocker.Mock()
    selected_category = category("assists")

    get_cache = mocker.patch.object(
        player_leaderboards_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        player_leaderboards_service.tournaments_service,
        "get_tournament",
        return_value=make_tournament(),
    )
    repo_get = mocker.patch.object(
        player_leaderboards_service.player_leaderboards_repo,
        "get_tournament_leaderboard_by_category",
        return_value=[],
    )
    mocker.patch.object(
        player_leaderboards_service,
        "get_tournament_data_ttl",
        return_value=timedelta(minutes=15),
    )
    mocker.patch.object(
        player_leaderboards_service,
        "get_expires_at",
        return_value=date(2026, 6, 21),
    )
    set_cache = mocker.patch.object(
        player_leaderboards_service.cache_service,
        "set_cache",
    )

    result = player_leaderboards_service.get_player_leaderboard(
        db,
        tournament_id=9,
        category=selected_category,
    )

    get_cache.assert_called_once_with(db, "player_leaderboards:9:assists")
    repo_get.assert_called_once_with(db, 9, selected_category)

    args, kwargs = set_cache.call_args
    assert args[0] is db
    assert args[1] == "player_leaderboards:9:assists"
    assert kwargs["payload"] == {"category": "assists", "data": []}

    assert result.category == selected_category
    assert result.data == []


def test_get_player_leaderboard_propagates_tournament_validation_error_and_does_not_cache(mocker):
    db = mocker.Mock()
    selected_category = category("yellow_cards")

    mocker.patch.object(
        player_leaderboards_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        player_leaderboards_service.tournaments_service,
        "get_tournament",
        side_effect=HTTPException(status_code=404, detail="Tournament not found"),
    )
    repo_get = mocker.patch.object(
        player_leaderboards_service.player_leaderboards_repo,
        "get_tournament_leaderboard_by_category",
    )
    set_cache = mocker.patch.object(
        player_leaderboards_service.cache_service,
        "set_cache",
    )

    with pytest.raises(HTTPException) as exc_info:
        player_leaderboards_service.get_player_leaderboard(
            db,
            tournament_id=404,
            category=selected_category,
        )

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Tournament not found"

    get_tournament.assert_called_once_with(db, 404)
    repo_get.assert_not_called()
    set_cache.assert_not_called()
