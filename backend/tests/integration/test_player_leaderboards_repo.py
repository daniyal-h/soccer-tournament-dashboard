from datetime import date
from decimal import Decimal

from app.api.v1.repositories.player_leaderboards import (
    get_tournament_leaderboard_by_category,
)
from app.models.enums import LeaderboardType
from app.models.player_leaderboards import PlayerLeaderboard
from app.models.players import Player
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


def make_tournament(
    *,
    external_api_id: int,
    name: str,
    season: str,
) -> Tournament:
    return Tournament(
        external_api_id=external_api_id,
        name=name,
        season=season,
        logo_url=None,
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )


def make_team(
    *,
    external_api_id: int,
    name: str,
    short_name: str,
) -> Team:
    return Team(
        external_api_id=external_api_id,
        name=name,
        short_name=short_name,
        type=TeamType.NATIONAL,
        logo_url=f"https://example.com/{short_name.lower()}.png",
        country=name,
    )


def make_player(
    *,
    external_api_id: int,
    display_name: str,
) -> Player:
    return Player(
        external_api_id=external_api_id,
        display_name=display_name,
        first_name=None,
        last_name=None,
        date_of_birth=None,
        photo_url=f"https://example.com/{external_api_id}.png",
        nationality=None,
        height=None,
    )


def test_get_tournament_leaderboard_by_category_filters_orders_limits_and_loads_relationships(
    db_session,
):
    tournament = make_tournament(
        external_api_id=1,
        name="World Cup",
        season="2022",
    )
    other_tournament = make_tournament(
        external_api_id=2,
        name="Euro",
        season="2024",
    )

    team = make_team(external_api_id=26, name="Argentina", short_name="ARG")
    other_team = make_team(external_api_id=2, name="France", short_name="FRA")

    db_session.add_all([tournament, other_tournament, team, other_team])
    db_session.flush()

    players = [
        make_player(external_api_id=index, display_name=f"Player {index}") for index in range(1, 26)
    ]
    other_player = make_player(external_api_id=99, display_name="Other Player")

    db_session.add_all([*players, other_player])
    db_session.flush()

    # Insert 22 matching rows out of order. The repo should return only top 20 by rank.
    for rank in range(22, 0, -1):
        db_session.add(
            PlayerLeaderboard(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=players[rank - 1].id,
                category=LeaderboardType.GOALS,
                rank=rank,
                value=100 - rank,
                appearances=7,
                minutes_played=600 - rank,
                rating=Decimal("7.50"),
            )
        )

    # Same tournament, wrong category. Should not be returned.
    db_session.add(
        PlayerLeaderboard(
            tournament_id=tournament.id,
            team_id=team.id,
            player_id=other_player.id,
            category=LeaderboardType.ASSISTS,
            rank=1,
            value=99,
            appearances=7,
            minutes_played=700,
            rating=Decimal("8.90"),
        )
    )

    # Same category, wrong tournament. Should not be returned.
    db_session.add(
        PlayerLeaderboard(
            tournament_id=other_tournament.id,
            team_id=other_team.id,
            player_id=other_player.id,
            category=LeaderboardType.GOALS,
            rank=1,
            value=99,
            appearances=7,
            minutes_played=700,
            rating=Decimal("8.90"),
        )
    )

    db_session.commit()

    rows = get_tournament_leaderboard_by_category(
        db_session,
        tournament.id,
        LeaderboardType.GOALS,
    )

    assert len(rows) == 20
    assert [row.rank for row in rows] == list(range(1, 21))
    assert all(row.tournament_id == tournament.id for row in rows)
    assert all(row.category == LeaderboardType.GOALS for row in rows)

    assert rows[0].value == 99
    assert rows[0].player.display_name == "Player 1"
    assert rows[0].player.photo_url == "https://example.com/1.png"
    assert rows[0].team.name == "Argentina"
    assert rows[0].team.short_name == "ARG"
    assert rows[0].minutes_played == 599
    assert rows[0].rating == Decimal("7.50")

    assert rows[-1].rank == 20
    assert rows[-1].player.display_name == "Player 20"


def test_get_tournament_leaderboard_by_category_returns_empty_list_when_no_category_matches(
    db_session,
):
    tournament = make_tournament(
        external_api_id=1,
        name="World Cup",
        season="2022",
    )
    team = make_team(external_api_id=26, name="Argentina", short_name="ARG")
    player = make_player(external_api_id=1, display_name="Player One")

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

    rows = get_tournament_leaderboard_by_category(
        db_session,
        tournament.id,
        LeaderboardType.YELLOW_CARDS,
    )

    assert rows == []
