from datetime import date

from app.api.v1.repositories.team_players import get_team_squad_by_tournament
from app.models.players import Player
from app.models.team import Team, TeamType
from app.models.team_player import PositionType, TeamPlayer
from app.models.tournament import Tournament


def make_player(
    external_api_id: int,
    display_name: str,
    first_name: str | None = None,
    last_name: str | None = None,
) -> Player:
    return Player(
        external_api_id=external_api_id,
        display_name=display_name,
        first_name=first_name,
        last_name=last_name,
        date_of_birth=None,
        photo_url=None,
        nationality=None,
        height=None,
    )


def test_get_team_squad_by_tournament_filters_by_tournament_and_team(db_session):
    tournament = Tournament(
        external_api_id=1,
        name="World Cup",
        season="2022",
        logo_url=None,
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )
    other_tournament = Tournament(
        external_api_id=2,
        name="Euro",
        season="2024",
        logo_url=None,
        start_date=date(2024, 6, 14),
        end_date=date(2024, 7, 14),
    )

    team = Team(
        external_api_id=13,
        name="Senegal",
        short_name="SEN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Senegal",
    )
    other_team = Team(
        external_api_id=14,
        name="Canada",
        short_name="CAN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Canada",
    )

    included_player = make_player(100, "A. Diallo", "Abdou-Lakhad", "Diallo")
    wrong_team_player = make_player(101, "Wrong Team")
    wrong_tournament_player = make_player(102, "Wrong Tournament")

    db_session.add_all(
        [
            tournament,
            other_tournament,
            team,
            other_team,
            included_player,
            wrong_team_player,
            wrong_tournament_player,
        ]
    )
    db_session.commit()

    db_session.add_all(
        [
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=included_player.id,
                squad_number=22,
                position=PositionType.DEF,
            ),
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=other_team.id,
                player_id=wrong_team_player.id,
                squad_number=10,
                position=PositionType.FWD,
            ),
            TeamPlayer(
                tournament_id=other_tournament.id,
                team_id=team.id,
                player_id=wrong_tournament_player.id,
                squad_number=8,
                position=PositionType.MID,
            ),
        ]
    )
    db_session.commit()

    squad = get_team_squad_by_tournament(db_session, tournament.id, team.id)

    assert len(squad) == 1
    assert squad[0].tournament_id == tournament.id
    assert squad[0].team_id == team.id
    assert squad[0].player_id == included_player.id
    assert squad[0].squad_number == 22
    assert squad[0].position == PositionType.DEF
    assert squad[0].player.display_name == "A. Diallo"


def test_get_team_squad_by_tournament_orders_by_position_number_and_player_id(db_session):
    tournament = Tournament(
        external_api_id=1,
        name="World Cup",
        season="2022",
        logo_url=None,
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )
    team = Team(
        external_api_id=13,
        name="Senegal",
        short_name="SEN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Senegal",
    )

    defender_two = make_player(200, "Defender Two")
    defender_one = make_player(201, "Defender One")
    midfielder = make_player(202, "Midfielder")
    unknown_position = make_player(203, "Unknown Position")
    null_number_defender = make_player(204, "Null Number Defender")

    db_session.add_all(
        [
            tournament,
            team,
            defender_two,
            defender_one,
            midfielder,
            unknown_position,
            null_number_defender,
        ]
    )
    db_session.commit()

    db_session.add_all(
        [
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=unknown_position.id,
                squad_number=1,
                position=None,
            ),
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=midfielder.id,
                squad_number=8,
                position=PositionType.MID,
            ),
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=defender_two.id,
                squad_number=5,
                position=PositionType.DEF,
            ),
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=defender_one.id,
                squad_number=2,
                position=PositionType.DEF,
            ),
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=null_number_defender.id,
                squad_number=None,
                position=PositionType.DEF,
            ),
        ]
    )
    db_session.commit()

    squad = get_team_squad_by_tournament(db_session, tournament.id, team.id)

    assert [row.player_id for row in squad] == [
        defender_one.id,
        defender_two.id,
        null_number_defender.id,
        midfielder.id,
        unknown_position.id,
    ]


def test_get_team_squad_by_tournament_uses_player_id_as_stable_tiebreaker(db_session):
    tournament = Tournament(
        external_api_id=1,
        name="World Cup",
        season="2022",
        logo_url=None,
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )
    team = Team(
        external_api_id=13,
        name="Senegal",
        short_name="SEN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Senegal",
    )

    first_player = make_player(300, "First Player")
    second_player = make_player(301, "Second Player")

    db_session.add_all([tournament, team, second_player, first_player])
    db_session.commit()

    db_session.add_all(
        [
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=second_player.id,
                squad_number=10,
                position=PositionType.FWD,
            ),
            TeamPlayer(
                tournament_id=tournament.id,
                team_id=team.id,
                player_id=first_player.id,
                squad_number=10,
                position=PositionType.FWD,
            ),
        ]
    )
    db_session.commit()

    squad = get_team_squad_by_tournament(db_session, tournament.id, team.id)

    assert [row.player_id for row in squad] == sorted([first_player.id, second_player.id])


def test_get_team_squad_by_tournament_returns_empty_list_for_missing_squad(db_session):
    squad = get_team_squad_by_tournament(db_session, tournament_id=999, team_id=999)

    assert squad == []
