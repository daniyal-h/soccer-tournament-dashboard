from datetime import date, timedelta

from app.api.v1.services import refresh_standings as refresh_standings_service
from app.constants.external_apis import API_FOOTBALL_STANDINGS_ENDPOINT
from app.models.refresh_job import JobStatus, RefreshJob
from app.models.standing import Standing
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


def test_refresh_standings_endpoint_fetches_and_persists_rows(
    client,
    db_session,
    mocker,
    admin_headers,
):
    today = date.today()

    tournament = Tournament(
        external_api_id=9,
        name="Copa America",
        season="2024",
        logo_url=None,
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=1),
    )

    team_a = Team(
        external_api_id=5529,
        name="Canada",
        short_name="CAN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Canada",
    )

    team_b = Team(
        external_api_id=7,
        name="Uruguay",
        short_name="URU",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Uruguay",
    )

    db_session.add_all([tournament, team_a, team_b])
    db_session.commit()

    football_get = mocker.patch.object(
        refresh_standings_service,
        "football_get",
        return_value={
            "response": [
                {
                    "league": {
                        "standings": [
                            [
                                {
                                    "rank": 1,
                                    "points": 6,
                                    "group": "Group A",
                                    "team": {"id": 5529},
                                    "all": {
                                        "win": 2,
                                        "draw": 0,
                                        "lose": 1,
                                        "goals": {"for": 5, "against": 2},
                                    },
                                },
                                {
                                    "rank": 2,
                                    "points": 4,
                                    "group": "Group A",
                                    "team": {"id": 7},
                                    "all": {
                                        "win": 1,
                                        "draw": 1,
                                        "lose": 1,
                                        "goals": {"for": 3, "against": 3},
                                    },
                                },
                            ]
                        ]
                    }
                }
            ]
        },
    )

    response = client.post(
        "/api/v1/admin/tournaments/refresh-standings",
        headers=admin_headers,
    )

    assert response.status_code == 200
    football_get.assert_called_once_with(
        API_FOOTBALL_STANDINGS_ENDPOINT,
        {
            "league": 9,
            "season": "2024",
        },
    )

    body = response.json()

    assert body["message"] == "Standings refresh completed"
    assert body["tournaments_checked"] == 1
    assert body["tournaments_refreshed"] == 1
    assert body["tournaments_skipped"] == 0
    assert body["rows_processed"] == 2
    assert body["failures"] == []

    standings = (
        db_session.query(Standing)
        .filter(Standing.tournament_id == tournament.id)
        .order_by(Standing.position.asc())
        .all()
    )

    assert len(standings) == 2

    assert standings[0].team_id == team_a.id
    assert standings[0].group == "A"
    assert standings[0].position == 1
    assert standings[0].points == 6
    assert standings[0].wins == 2
    assert standings[0].draws == 0
    assert standings[0].losses == 1
    assert standings[0].goals_for == 5
    assert standings[0].goals_against == 2

    assert standings[1].team_id == team_b.id
    assert standings[1].group == "A"
    assert standings[1].position == 2
    assert standings[1].points == 4

    refresh_job = db_session.query(RefreshJob).one()

    assert refresh_job.status == JobStatus.SUCCESS


def test_refresh_standings_rejects_invalid_token(client):
    response = client.post(
        "/api/v1/admin/tournaments/refresh-standings",
        headers={"Authorization": "Bearer wrong_token"},
    )

    assert response.status_code == 403
