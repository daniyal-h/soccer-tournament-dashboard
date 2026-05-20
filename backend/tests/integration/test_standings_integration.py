from datetime import date

from app.models.standing import Standing
from app.models.team import Team
from app.models.tournament import Tournament


def test_standings_ranked_correctly(client, db_session):
    # seed a tournament
    start_date = (date(2026, 6, 11),)
    end_date = (date(2026, 7, 19),)
    tournament = Tournament(
        id=1,
        external_api_id=1,
        name="Test Cup",
        season="2026",
        start_date=start_date,
        end_date=end_date,
    )
    db_session.add(tournament)
    db_session.flush()  # write tournament before standings FK is checked

    # seed teams in the tournament
    db_session.add_all(
        [
            Team(
                id=1,
                external_api_id=201,
                name="Team A",
                short_name="TMA",
                type="national",
                country="Country A",
            ),
            Team(
                id=2,
                external_api_id=202,
                name="Team B",
                short_name="TMB",
                type="national",
                country="Country B",
            ),
            Team(
                id=3,
                external_api_id=203,
                name="Team C",
                short_name="TMC",
                type="national",
                country="Country C",
            ),
        ]
    )
    db_session.flush()

    # seed standings in wrong order deliberately
    db_session.add_all(
        [
            Standing(
                tournament_id=1,
                team_id=1,
                group="A",
                points=3,
                goals_for=1,
                goals_against=0,
                wins=1,
                draws=0,
                losses=0,
                position=1,
            ),
            Standing(
                tournament_id=1,
                team_id=2,
                group="A",
                points=9,
                goals_for=5,
                goals_against=1,
                wins=3,
                draws=0,
                losses=0,
                position=2,
            ),
            Standing(
                tournament_id=1,
                team_id=3,
                group="A",
                points=6,
                goals_for=3,
                goals_against=2,
                wins=2,
                draws=0,
                losses=1,
                position=3,
            ),
        ]
    )
    db_session.commit()

    response = client.get("/api/v1/standings/1")
    assert response.status_code == 200

    group_a = response.json()["A"]
    assert group_a[0]["points"] == 9  # first
    assert group_a[1]["points"] == 6  # second
    assert group_a[2]["points"] == 3  # third
