from datetime import date, timedelta

from app.api.v1.services import refresh_matches as refresh_matches_service
from app.constants.external_apis import API_FOOTBALL_FIXTURES_ENDPOINT
from app.models.enums import StatusType
from app.models.match import Match, StageType
from app.models.refresh_job import JobStatus, RefreshJob
from app.models.team import Team, TeamType
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam


def test_refresh_matches_endpoint_fetches_and_persists_rows(
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

    db_session.add_all(
        [
            TournamentTeam(
                tournament_id=tournament.id,
                team_id=team_a.id,
                group="A",
            ),
            TournamentTeam(
                tournament_id=tournament.id,
                team_id=team_b.id,
                group="A",
            ),
        ]
    )
    db_session.commit()

    football_get = mocker.patch.object(
        refresh_matches_service,
        "football_get",
        return_value={
            "response": [
                {
                    "fixture": {
                        "id": 1234029,
                        "date": "2024-07-14T00:00:00+00:00",
                        "venue": {
                            "name": "Bank of America Stadium",
                            "city": "Charlotte, North Carolina",
                        },
                        "status": {
                            "short": "PEN",
                            "elapsed": 120,
                        },
                    },
                    "league": {
                        "round": "Group Stage - 1",
                    },
                    "teams": {
                        "home": {"id": 5529},
                        "away": {"id": 7},
                    },
                    "goals": {
                        "home": 2,
                        "away": 2,
                    },
                    "score": {
                        "penalty": {
                            "home": 3,
                            "away": 4,
                        }
                    },
                }
            ]
        },
    )

    response = client.post(
        "/api/v1/admin/tournaments/refresh-matches?margin_days=1",
        headers=admin_headers,
    )

    assert response.status_code == 200

    football_get.assert_called_once_with(
        API_FOOTBALL_FIXTURES_ENDPOINT,
        {
            "league": 9,
            "season": "2024",
        },
    )

    body = response.json()

    assert body["message"] == "Matches refresh completed"
    assert body["tournaments_checked"] == 1
    assert body["tournaments_refreshed"] == 1
    assert body["tournaments_skipped"] == 0
    assert body["rows_processed"] == 1
    assert body["failures"] == []

    matches = db_session.query(Match).filter_by(tournament_id=tournament.id).all()

    assert len(matches) == 1

    match = matches[0]

    assert match.external_api_id == 1234029
    assert match.tournament_id == tournament.id
    assert match.team_a_id == team_a.id
    assert match.team_b_id == team_b.id
    assert match.stage == StageType.GROUP
    assert match.group == "A"
    assert match.status == StatusType.FINISHED
    assert match.venue == "Bank of America Stadium"
    assert match.city == "Charlotte, North Carolina"
    assert match.elapsed == 120
    assert match.team_a_score == 2
    assert match.team_b_score == 2
    assert match.team_a_penalties == 3
    assert match.team_b_penalties == 4

    refresh_job = db_session.query(RefreshJob).one()

    assert refresh_job.status == JobStatus.SUCCESS
