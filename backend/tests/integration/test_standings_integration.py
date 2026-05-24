from datetime import date

import pytest

from app.models.standing import Standing
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam


@pytest.fixture
def seeded_tournament(db_session):
    # initialize tournament
    tournament = Tournament(
        id=1,
        external_api_id=1,
        name="Test Cup",
        season="2026",
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )
    db_session.add(tournament)
    db_session.flush()

    # add teams
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

    # link teams to the tournament
    db_session.add_all(
        [
            TournamentTeam(tournament_id=1, team_id=1, group="A"),
            TournamentTeam(tournament_id=1, team_id=2, group="A"),
            TournamentTeam(tournament_id=1, team_id=3, group="A"),
        ]
    )
    db_session.commit()

    return tournament


# validate that empty standings returns zero-state
def test_standings_zero_state(client, db_session, seeded_tournament):
    response = client.get("/api/v1/standings/1")
    assert response.status_code == 200

    group_a = response.json()["A"]
    assert len(group_a) == 3
    assert all(row["points"] == 0 for row in group_a)
    assert all(row["position"] == 0 for row in group_a)


def test_standings_filter_by_group(client, db_session, seeded_tournament):
    db_session.add(
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
        )
    )
    db_session.commit()

    response = client.get("/api/v1/standings/1?group=A")

    assert response.status_code == 200
    assert list(response.json().keys()) == ["A"]


# validate tiebreaker logic with added standings
def test_standings_ranked_correctly(client, db_session, seeded_tournament):
    # set standings
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
    assert group_a[0]["points"] == 9
    assert group_a[1]["points"] == 6
    assert group_a[2]["points"] == 3


def test_standings_invalid_group_returns_422(
    client,
    db_session,
    seeded_tournament,
):
    response = client.get("/api/v1/standings/1?group=Z")

    assert response.status_code == 422
