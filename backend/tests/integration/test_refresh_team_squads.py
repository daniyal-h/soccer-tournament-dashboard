import json
from datetime import UTC, date, datetime, timedelta

from backend.app.api.v1.services.refresh_team_squads import refresh_team_squads

from app.constants.external_apis import API_FOOTBALL_PLAYERS_ENDPOINT
from app.models.cache_entry import CacheEntry
from app.models.enums import JobName, JobStatus
from app.models.players import Player
from app.models.refresh_job import RefreshJob
from app.models.team import Team, TeamType
from app.models.team_player import PositionType, TeamPlayer
from app.models.tournament import Tournament


def make_tournament(
    *,
    external_api_id: int,
    name: str,
    season: str,
    start_date: date,
    end_date: date,
) -> Tournament:
    return Tournament(
        external_api_id=external_api_id,
        name=name,
        season=season,
        logo_url=None,
        start_date=start_date,
        end_date=end_date,
    )


def make_team(
    *,
    external_api_id: int,
    name: str,
    short_name: str,
    country: str,
) -> Team:
    return Team(
        external_api_id=external_api_id,
        name=name,
        short_name=short_name,
        type=TeamType.NATIONAL,
        logo_url=None,
        country=country,
    )


def make_player_response(
    *,
    player_id: int,
    team_id: int,
    league_id: int,
    season: str | int,
    name: str = "Test Player",
    firstname: str | None = "Test",
    lastname: str | None = "Player",
    birth_date: str | None = "2000-01-01",
    height: str | None = "180 cm",
    number: int | None = 10,
    position: str | None = "Attacker",
) -> dict:
    return {
        "player": {
            "id": player_id,
            "name": name,
            "firstname": firstname,
            "lastname": lastname,
            "birth": {"date": birth_date},
            "photo": f"https://example.com/{player_id}.png",
            "nationality": "Canada",
            "height": height,
        },
        "statistics": [
            {
                "team": {"id": team_id},
                "league": {"id": league_id, "season": season},
                "games": {"number": number, "position": position},
            }
        ],
    }


def test_refresh_team_squads_inserts_players_team_players_invalidates_cache_and_success_job(
    db_session,
    mocker,
):
    today = date.today()

    tournament = make_tournament(
        external_api_id=100,
        name="World Cup",
        season="2026",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )
    team = make_team(
        external_api_id=200,
        name="Canada",
        short_name="CAN",
        country="Canada",
    )

    db_session.add_all([tournament, team])
    db_session.commit()

    now = datetime.now(UTC)

    db_session.add_all(
        [
            CacheEntry(
                cache_key=f"team_squad:{tournament.id}:{team.id}",
                payload=json.dumps([]),
                last_updated=now,
                expires_at=now + timedelta(hours=1),
            ),
            CacheEntry(
                cache_key=f"team_squad:{tournament.id + 100}:999",
                payload=json.dumps([]),
                last_updated=now,
                expires_at=now + timedelta(hours=1),
            ),
            CacheEntry(
                cache_key=f"standings:{tournament.id}",
                payload=json.dumps([]),
                last_updated=now,
                expires_at=now + timedelta(hours=1),
            ),
        ]
    )
    db_session.commit()

    football_get = mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        side_effect=[
            {
                "paging": {"total": 2},
                "response": [
                    make_player_response(
                        player_id=300,
                        team_id=200,
                        league_id=100,
                        season="2026",
                        name="Jonathan David",
                        firstname="Jonathan",
                        lastname="David",
                        birth_date="2000-01-14",
                        height="180 cm",
                        number=20,
                        position="Attacker",
                    )
                ],
            },
            {
                "paging": {"total": 2},
                "response": [
                    make_player_response(
                        player_id=301,
                        team_id=200,
                        league_id=100,
                        season=2026,
                        name="Alphonso Davies",
                        firstname="Alphonso",
                        lastname="Davies",
                        birth_date="2000-11-02",
                        height="183 cm",
                        number=19,
                        position="Defender",
                    )
                ],
            },
        ],
    )

    result = refresh_team_squads(db_session, margin_days=1)

    players = db_session.query(Player).order_by(Player.external_api_id).all()
    team_players = db_session.query(TeamPlayer).order_by(TeamPlayer.player_id).all()
    job = (
        db_session.query(RefreshJob).where(RefreshJob.job_name == JobName.TEAM_SQUADS_REFRESH).one()
    )
    remaining_cache_keys = {row.cache_key for row in db_session.query(CacheEntry).all()}

    assert football_get.call_args_list == [
        mocker.call(
            API_FOOTBALL_PLAYERS_ENDPOINT,
            {"league": 100, "season": "2026", "page": 1},
        ),
        mocker.call(
            API_FOOTBALL_PLAYERS_ENDPOINT,
            {"league": 100, "season": "2026", "page": 2},
        ),
    ]

    assert remaining_cache_keys == {
        f"team_squad:{tournament.id + 100}:999",
        f"standings:{tournament.id}",
    }

    assert [(player.external_api_id, player.display_name) for player in players] == [
        (300, "Jonathan David"),
        (301, "Alphonso Davies"),
    ]
    assert players[0].first_name == "Jonathan"
    assert players[0].last_name == "David"
    assert players[0].date_of_birth == date(2000, 1, 14)
    assert players[0].height == 180

    assert players[1].first_name == "Alphonso"
    assert players[1].last_name == "Davies"
    assert players[1].date_of_birth == date(2000, 11, 2)
    assert players[1].height == 183

    assert [
        (
            row.tournament_id,
            row.team_id,
            row.player_id,
            row.squad_number,
            row.position,
        )
        for row in team_players
    ] == [
        (tournament.id, team.id, players[0].id, 20, PositionType.FWD),
        (tournament.id, team.id, players[1].id, 19, PositionType.DEF),
    ]

    assert job.status == JobStatus.SUCCESS
    assert job.finished_at is not None

    assert result["resource_name"] == "Player Data"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 2
    assert result["failures"] == []


def test_refresh_team_squads_updates_existing_player_and_team_player_registration(
    db_session,
    mocker,
):
    today = date.today()

    tournament = make_tournament(
        external_api_id=101,
        name="World Cup",
        season="2026",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )
    team = make_team(
        external_api_id=201,
        name="Senegal",
        short_name="SEN",
        country="Senegal",
    )
    existing_player = Player(
        external_api_id=3010,
        display_name="Old Name",
        first_name="Old",
        last_name="Name",
        date_of_birth=date(1999, 1, 1),
        photo_url="https://example.com/old.png",
        nationality="Oldland",
        height=170,
    )

    db_session.add_all([tournament, team, existing_player])
    db_session.commit()

    db_session.add(
        TeamPlayer(
            tournament_id=tournament.id,
            team_id=team.id,
            player_id=existing_player.id,
            squad_number=99,
            position=PositionType.DEF,
        )
    )
    db_session.commit()

    original_player_id = existing_player.id
    original_created_at = existing_player.created_at

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        return_value={
            "paging": {"total": 1},
            "response": [
                make_player_response(
                    player_id=3010,
                    team_id=201,
                    league_id=101,
                    season="2026",
                    name="Updated Name",
                    firstname="Updated",
                    lastname="Player",
                    birth_date="2001-02-03",
                    height="181 cm",
                    number=7,
                    position="Midfielder",
                )
            ],
        },
    )

    result = refresh_team_squads(db_session, margin_days=1)

    player = db_session.query(Player).where(Player.external_api_id == 3010).one()
    registration = (
        db_session.query(TeamPlayer)
        .where(
            TeamPlayer.tournament_id == tournament.id,
            TeamPlayer.team_id == team.id,
            TeamPlayer.player_id == player.id,
        )
        .one()
    )

    assert player.id == original_player_id
    assert player.created_at == original_created_at
    assert player.display_name == "Updated Name"
    assert player.first_name == "Updated"
    assert player.last_name == "Player"
    assert player.date_of_birth == date(2001, 2, 3)
    assert player.height == 181

    assert registration.squad_number == 7
    assert registration.position == PositionType.MID

    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == []


def test_refresh_team_squads_filters_invalid_rows_and_deduplicates(
    db_session,
    mocker,
):
    today = date.today()

    tournament = make_tournament(
        external_api_id=102,
        name="World Cup",
        season="2026",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )
    team = make_team(
        external_api_id=202,
        name="Argentina",
        short_name="ARG",
        country="Argentina",
    )

    db_session.add_all([tournament, team])
    db_session.commit()

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        return_value={
            "paging": {"total": 1},
            "response": [
                make_player_response(
                    player_id=400,
                    team_id=202,
                    league_id=102,
                    season="2026",
                    name="Valid Player",
                    number=10,
                    position="Attacker",
                ),
                make_player_response(
                    player_id=400,
                    team_id=202,
                    league_id=102,
                    season="2026",
                    name="Duplicate Player",
                    number=11,
                    position="Midfielder",
                ),
                make_player_response(
                    player_id=402,
                    team_id=202,
                    league_id=999999,
                    season="2026",
                    name="Wrong League",
                ),
                make_player_response(
                    player_id=403,
                    team_id=202,
                    league_id=102,
                    season="2025",
                    name="Wrong Season",
                ),
                {
                    "player": {"id": None, "name": "Missing ID"},
                    "statistics": [],
                },
            ],
        },
    )

    result = refresh_team_squads(db_session, margin_days=1)

    players = db_session.query(Player).all()
    team_players = db_session.query(TeamPlayer).all()
    job = (
        db_session.query(RefreshJob).where(RefreshJob.job_name == JobName.TEAM_SQUADS_REFRESH).one()
    )

    assert len(players) == 1
    assert players[0].external_api_id == 400
    assert players[0].display_name == "Valid Player"

    assert len(team_players) == 1
    assert team_players[0].tournament_id == tournament.id
    assert team_players[0].team_id == team.id
    assert team_players[0].player_id == players[0].id
    assert team_players[0].squad_number == 10
    assert team_players[0].position == PositionType.FWD

    assert job.status == JobStatus.SUCCESS
    assert job.finished_at is not None

    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == []


def test_refresh_team_squads_records_failure_for_one_tournament_and_continues(
    db_session,
    mocker,
):
    today = date.today()

    good_tournament = make_tournament(
        external_api_id=103,
        name="Good Tournament",
        season="2026",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )
    bad_tournament = make_tournament(
        external_api_id=104,
        name="Bad Tournament",
        season="2026",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )
    team = make_team(
        external_api_id=203,
        name="France",
        short_name="FRA",
        country="France",
    )

    db_session.add_all([good_tournament, bad_tournament, team])
    db_session.commit()

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        side_effect=[
            {
                "paging": {"total": 1},
                "response": [
                    make_player_response(
                        player_id=500,
                        team_id=203,
                        league_id=103,
                        season="2026",
                        name="Successful Player",
                    )
                ],
            },
            RuntimeError("API exploded"),
        ],
    )

    result = refresh_team_squads(db_session, margin_days=1)

    player = db_session.query(Player).where(Player.external_api_id == 500).one()
    registration = db_session.query(TeamPlayer).one()
    job = (
        db_session.query(RefreshJob).where(RefreshJob.job_name == JobName.TEAM_SQUADS_REFRESH).one()
    )

    assert player.display_name == "Successful Player"
    assert registration.tournament_id == good_tournament.id

    assert job.status == JobStatus.FAILED
    assert job.finished_at is not None

    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == [
        {
            "tournament_id": bad_tournament.id,
            "external_api_id": bad_tournament.external_api_id,
            "season": bad_tournament.season,
            "reason": "API exploded",
        }
    ]


def test_refresh_team_squads_marks_tournament_skipped_when_api_returns_no_rows(
    db_session,
    mocker,
):
    today = date.today()

    tournament = make_tournament(
        external_api_id=105,
        name="Empty Tournament",
        season="2026",
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )

    db_session.add(tournament)
    db_session.commit()

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        return_value={"paging": {"total": 1}, "response": []},
    )

    result = refresh_team_squads(db_session, margin_days=1)

    job = (
        db_session.query(RefreshJob).where(RefreshJob.job_name == JobName.TEAM_SQUADS_REFRESH).one()
    )

    assert db_session.query(Player).count() == 0
    assert db_session.query(TeamPlayer).count() == 0

    assert job.status == JobStatus.SUCCESS
    assert job.finished_at is not None

    assert result["tournaments_checked"] == 1
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == []
