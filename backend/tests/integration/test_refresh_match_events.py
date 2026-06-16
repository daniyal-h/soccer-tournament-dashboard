from datetime import UTC, date, datetime, timedelta

from app.api.v1.services import refresh_match_events as refresh_match_events_service
from app.constants.external_apis import API_FOOTBALL_EVENTS_ENDPOINT
from app.models.enums import EventType, StageType, StatusType
from app.models.match import Match
from app.models.match_event import MatchEvent
from app.models.players import Player
from app.models.refresh_job import JobStatus, RefreshJob
from app.models.team import Team, TeamType
from app.models.tournament import Tournament

REFRESH_MATCH_EVENTS_PATH = "/api/v1/admin/tournaments/refresh-match-events"


def test_refresh_match_events_endpoint_fetches_and_persists_rows(
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

    team = Team(
        external_api_id=5529,
        name="Canada",
        short_name="CAN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Canada",
    )

    opponent = Team(
        external_api_id=7,
        name="Uruguay",
        short_name="URU",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Uruguay",
    )

    player = Player(
        external_api_id=1001,
        first_name="Jonathan",
        last_name="David",
        date_of_birth=date(2000, 1, 14),
        photo_url=None,
        nationality="Canada",
        height=180,
    )

    assist_player = Player(
        external_api_id=1002,
        first_name="Alphonso",
        last_name="Davies",
        date_of_birth=date(2000, 11, 2),
        photo_url=None,
        nationality="Canada",
        height=183,
    )

    db_session.add_all([tournament, team, opponent, player, assist_player])
    db_session.commit()

    match = Match(
        external_api_id=1234029,
        tournament_id=tournament.id,
        team_a_id=team.id,
        team_b_id=opponent.id,
        kickoff_time=datetime.now(UTC),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.LIVE,
        venue="Bank of America Stadium",
        city="Charlotte, North Carolina",
        elapsed=55,
        team_a_score=1,
        team_b_score=0,
    )

    db_session.add(match)
    db_session.commit()

    football_get = mocker.patch.object(
        refresh_match_events_service,
        "football_get",
        return_value={
            "response": [
                {
                    "time": {"elapsed": 80, "extra": 2},
                    "team": {"id": 5529, "name": "Canada"},
                    "player": {"id": 1001, "name": "J. David"},
                    "assist": {"id": 1002, "name": "A. Davies"},
                    "type": "Goal",
                    "detail": "Normal Goal",
                    "comments": "right footed shot",
                }
            ]
        },
    )

    response = client.post(
        REFRESH_MATCH_EVENTS_PATH,
        headers=admin_headers,
    )

    assert response.status_code == 200

    football_get.assert_called_once_with(
        API_FOOTBALL_EVENTS_ENDPOINT,
        {
            "fixture": 1234029,
        },
    )

    body = response.json()

    assert body["message"] == "Match Events refresh completed"
    assert body["tournaments_checked"] == 1
    assert body["tournaments_refreshed"] == 1
    assert body["tournaments_skipped"] == 0
    assert body["rows_processed"] == 1
    assert body["failures"] == []

    events = db_session.query(MatchEvent).filter_by(match_id=match.id).all()

    assert len(events) == 1

    event = events[0]

    assert event.match_id == match.id
    assert event.team_id == team.id
    assert event.player_id == player.id
    assert event.secondary_player_id == assist_player.id
    assert event.player_external_id == 1001
    assert event.secondary_player_external_id == 1002
    assert event.player_name == "J. David"
    assert event.secondary_player_name == "A. Davies"
    assert event.event_type == EventType.GOAL
    assert event.minute == 80
    assert event.extra_minute == 2
    assert event.detail == "Normal Goal"
    assert event.comments == "right footed shot"

    refresh_job = db_session.query(RefreshJob).one()

    assert refresh_job.status == JobStatus.SUCCESS


def test_refresh_match_events_rejects_invalid_token(client):
    response = client.post(
        REFRESH_MATCH_EVENTS_PATH,
        headers={"Authorization": "Bearer wrong_token"},
    )

    assert response.status_code == 403
