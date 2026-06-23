from datetime import UTC, datetime, timedelta
from decimal import Decimal

from app.api.v1.services import refresh_player_leaderboards as refresh_service
from app.models.cache_entry import CacheEntry
from app.models.enums import JobName, JobStatus, LeaderboardType
from app.models.player_leaderboards import PlayerLeaderboard
from app.models.players import Player
from app.models.refresh_job import RefreshJob
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


def test_refresh_player_leaderboards_full_flow_replaces_rows_tracks_job_and_invalidates_cache(
    db_session,
    mocker,
):
    tournament = Tournament(
        external_api_id=39,
        name="World Cup",
        season="2024",
        logo_url=None,
        start_date=datetime(2024, 6, 1, tzinfo=UTC).date(),
        end_date=datetime(2024, 7, 1, tzinfo=UTC).date(),
    )
    other_tournament = Tournament(
        external_api_id=40,
        name="Euro",
        season="2024",
        logo_url=None,
        start_date=datetime(2024, 6, 1, tzinfo=UTC).date(),
        end_date=datetime(2024, 7, 1, tzinfo=UTC).date(),
    )

    team = Team(
        external_api_id=201,
        name="France",
        short_name="FRA",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="France",
    )
    old_team = Team(
        external_api_id=202,
        name="Old Team",
        short_name="OLD",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Old",
    )

    player = Player(
        external_api_id=101,
        display_name="Kylian Mbappé",
        first_name="Kylian",
        last_name="Mbappé",
        date_of_birth=datetime(1998, 12, 20, tzinfo=UTC).date(),
        photo_url=None,
        nationality="France",
        height=178,
    )
    old_player = Player(
        external_api_id=102,
        display_name="Old Player",
        first_name="Old",
        last_name="Player",
        date_of_birth=datetime(1990, 1, 1, tzinfo=UTC).date(),
        photo_url=None,
        nationality="France",
        height=180,
    )

    db_session.add_all([tournament, other_tournament, team, old_team, player, old_player])
    db_session.flush()

    db_session.add(
        PlayerLeaderboard(
            tournament_id=tournament.id,
            team_id=old_team.id,
            player_id=old_player.id,
            category=LeaderboardType.GOALS,
            rank=1,
            value=99,
            appearances=7,
            minutes_played=700,
            rating=9.9,
        )
    )

    now = datetime.now(UTC)
    db_session.add_all(
        [
            CacheEntry(
                cache_key=f"player_leaderboard:{tournament.id}:goals",
                payload="{}",
                last_updated=now,
                expires_at=now + timedelta(hours=1),
            ),
            CacheEntry(
                cache_key=f"player_leaderboard:{tournament.id}:assists",
                payload="{}",
                last_updated=now,
                expires_at=now + timedelta(hours=1),
            ),
            CacheEntry(
                cache_key=f"player_leaderboard:{other_tournament.id}:goals",
                payload="{}",
                last_updated=now,
                expires_at=now + timedelta(hours=1),
            ),
        ]
    )
    db_session.commit()

    mocker.patch.object(
        refresh_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch.object(
        refresh_service,
        "API_FOOTBALL_LEADERBOARD_ENDPOINTS",
        {"goals": "/players/topscorers"},
    )
    mocker.patch.object(
        refresh_service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {
                                "appearences": "5",
                                "minutes": "450",
                                "rating": "7.355",
                            },
                            "goals": {"total": 6},
                            "cards": {"yellow": 1},
                        }
                    ],
                }
            ]
        },
    )

    result = refresh_service.refresh_player_leaderboards(db_session)

    assert result["resource_name"] == "Player Leaderboards"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == []

    rows = db_session.query(PlayerLeaderboard).filter_by(tournament_id=tournament.id).all()

    assert len(rows) == 1
    assert rows[0].player_id == player.id
    assert rows[0].team_id == team.id
    assert rows[0].category == LeaderboardType.GOALS
    assert rows[0].rank == 1
    assert rows[0].value == 6
    assert rows[0].appearances == 5
    assert rows[0].minutes_played == 450
    assert rows[0].rating == Decimal("7.36")

    assert (
        db_session.query(PlayerLeaderboard)
        .filter_by(tournament_id=tournament.id, player_id=old_player.id)
        .count()
        == 0
    )

    job = db_session.query(RefreshJob).one()
    assert job.job_name == JobName.PLAYER_LEADERBOARDS_REFRESH
    assert job.status == JobStatus.SUCCESS
    assert job.finished_at is not None

    remaining_cache_keys = {
        row.cache_key for row in db_session.query(CacheEntry).order_by(CacheEntry.cache_key).all()
    }

    assert f"player_leaderboard:{tournament.id}:goals" not in remaining_cache_keys
    assert f"player_leaderboard:{tournament.id}:assists" not in remaining_cache_keys
    assert f"player_leaderboard:{other_tournament.id}:goals" in remaining_cache_keys
