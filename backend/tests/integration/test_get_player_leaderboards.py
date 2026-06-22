import json
from datetime import date
from decimal import Decimal

from app.api.v1.services.player_leaderboards import get_player_leaderboard
from app.models.cache_entry import CacheEntry
from app.models.enums import LeaderboardType
from app.models.player_leaderboards import PlayerLeaderboard
from app.models.players import Player
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


def make_tournament() -> Tournament:
    return Tournament(
        external_api_id=1,
        name="World Cup",
        season="2022",
        logo_url=None,
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )


def make_team() -> Team:
    return Team(
        external_api_id=26,
        name="Argentina",
        short_name="ARG",
        type=TeamType.NATIONAL,
        logo_url="https://example.com/arg.png",
        country="Argentina",
    )


def make_player() -> Player:
    return Player(
        external_api_id=1493,
        display_name="M. Acuña",
        first_name="Marcos Javier",
        last_name="Acuña",
        date_of_birth=date(1991, 10, 28),
        photo_url="https://example.com/acuna.png",
        nationality="Argentina",
        height=172,
    )


def test_get_player_leaderboard_cache_miss_returns_rows_and_writes_cache(db_session):
    tournament = make_tournament()
    team = make_team()
    player = make_player()

    db_session.add_all([tournament, team, player])
    db_session.flush()

    db_session.add(
        PlayerLeaderboard(
            tournament_id=tournament.id,
            team_id=team.id,
            player_id=player.id,
            category=LeaderboardType.GOALS,
            rank=1,
            value=8,
            appearances=7,
            minutes_played=597,
            rating=Decimal("7.61"),
        )
    )
    db_session.commit()

    result = get_player_leaderboard(
        db_session,
        tournament.id,
        LeaderboardType.GOALS,
    )

    assert result.category == LeaderboardType.GOALS
    assert len(result.data) == 1

    row = result.data[0]
    assert row.rank == 1
    assert row.value == 8
    assert row.appearances == 7
    assert row.minutes_played == 597
    assert row.rating == 7.61
    assert row.player.display_name == "M. Acuña"
    assert row.player.photo_url == "https://example.com/acuna.png"
    assert row.team.name == "Argentina"
    assert row.team.short_name == "ARG"

    cache_entry = (
        db_session.query(CacheEntry)
        .where(CacheEntry.cache_key == f"player_leaderboards:{tournament.id}:goals")
        .one_or_none()
    )

    assert cache_entry is not None
    payload = json.loads(cache_entry.payload)

    assert payload["category"] == "goals"
    assert payload["data"][0]["minutes_played"] == 597
    assert payload["data"][0]["value"] == 8
    assert payload["data"][0]["player"]["display_name"] == "M. Acuña"
    assert payload["data"][0]["team"]["short_name"] == "ARG"
    assert cache_entry.expires_at is not None


def test_get_player_leaderboard_cache_hit_returns_cached_payload_without_using_fresh_db_rows(
    db_session,
):
    tournament = make_tournament()
    team = make_team()
    player = make_player()

    db_session.add_all([tournament, team, player])
    db_session.flush()

    leaderboard = PlayerLeaderboard(
        tournament_id=tournament.id,
        team_id=team.id,
        player_id=player.id,
        category=LeaderboardType.GOALS,
        rank=1,
        value=8,
        appearances=7,
        minutes_played=597,
        rating=Decimal("7.61"),
    )

    db_session.add(leaderboard)
    db_session.commit()

    first_result = get_player_leaderboard(
        db_session,
        tournament.id,
        LeaderboardType.GOALS,
    )

    assert first_result.data[0].value == 8
    assert first_result.data[0].minutes_played == 597

    leaderboard.value = 99
    leaderboard.minutes_played = 999
    db_session.commit()

    second_result = get_player_leaderboard(
        db_session,
        tournament.id,
        LeaderboardType.GOALS,
    )

    assert second_result.data[0].value == 8
    assert second_result.data[0].minutes_played == 597

    cache_entries = (
        db_session.query(CacheEntry)
        .where(CacheEntry.cache_key == f"player_leaderboards:{tournament.id}:goals")
        .all()
    )

    assert len(cache_entries) == 1


def test_get_player_leaderboard_uses_category_specific_cache_keys(db_session):
    tournament = make_tournament()
    team = make_team()

    goals_player = make_player()
    assists_player = Player(
        external_api_id=278,
        display_name="L. Messi",
        first_name="Lionel",
        last_name="Messi",
        date_of_birth=date(1987, 6, 24),
        photo_url="https://example.com/messi.png",
        nationality="Argentina",
        height=170,
    )

    db_session.add_all([tournament, team, goals_player, assists_player])
    db_session.flush()

    db_session.add_all(
        [
            PlayerLeaderboard(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=goals_player.id,
                category=LeaderboardType.GOALS,
                rank=1,
                value=8,
                appearances=7,
                minutes_played=597,
                rating=Decimal("7.61"),
            ),
            PlayerLeaderboard(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=assists_player.id,
                category=LeaderboardType.ASSISTS,
                rank=1,
                value=5,
                appearances=7,
                minutes_played=690,
                rating=Decimal("8.25"),
            ),
        ]
    )
    db_session.commit()

    goals_result = get_player_leaderboard(
        db_session,
        tournament.id,
        LeaderboardType.GOALS,
    )
    assists_result = get_player_leaderboard(
        db_session,
        tournament.id,
        LeaderboardType.ASSISTS,
    )

    assert goals_result.category == LeaderboardType.GOALS
    assert goals_result.data[0].player.display_name == "M. Acuña"
    assert goals_result.data[0].value == 8

    assert assists_result.category == LeaderboardType.ASSISTS
    assert assists_result.data[0].player.display_name == "L. Messi"
    assert assists_result.data[0].value == 5

    cache_keys = {
        row.cache_key
        for row in db_session.query(CacheEntry)
        .where(CacheEntry.cache_key.like(f"player_leaderboards:{tournament.id}:%"))
        .all()
    }

    assert cache_keys == {
        f"player_leaderboards:{tournament.id}:goals",
        f"player_leaderboards:{tournament.id}:assists",
    }
