from types import SimpleNamespace

import pytest

from app.api.v1.services import refresh_player_leaderboards as service
from app.models.enums import JobName


def make_tournament(
    tournament_id: int = 1,
    external_api_id: int = 39,
    season: str = "2024",
):
    return SimpleNamespace(
        id=tournament_id,
        external_api_id=external_api_id,
        season=season,
    )


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, None),
        ("", None),
        ("12", 12),
        (12, 12),
        ("bad", None),
        ({}, None),
    ],
)
def test_nullable_int(value, expected):
    assert service.nullable_int(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, None),
        ("", None),
        ("7.345", 7.34),
        ("7.355", 7.36),
        (8, 8.0),
        ("bad", None),
    ],
)
def test_nullable_numeric(value, expected):
    assert service.nullable_numeric(value) == expected


@pytest.mark.parametrize(
    ("category", "stats", "expected"),
    [
        ("goals", {"goals": {"total": 5}}, 5),
        ("goals", {"goals": {"total": None}}, 0),
        ("assists", {"goals": {"assists": 3}}, 3),
        ("assists", {"goals": {"assists": None}}, 0),
        ("yellow_cards", {"cards": {"yellow": 2}}, 2),
        ("yellow_cards", {"cards": {"yellow": None}}, 0),
        ("unknown", {"goals": {"total": 99}, "cards": {"yellow": 99}}, 0),
        ("goals", {}, 0),
    ],
)
def test_get_leaderboard_value(category, stats, expected):
    assert service.get_leaderboard_value(category, stats) == expected


def test_fetch_player_leaderboards_for_tournament_filters_and_maps_rows(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service,
        "API_FOOTBALL_LEADERBOARD_ENDPOINTS",
        {
            "goals": "/players/topscorers",
            "assists": "/players/topassists",
            "yellow_cards": "/players/topyellowcards",
        },
    )

    responses = {
        "/players/topscorers": {
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {
                                "appearences": "4",
                                "minutes": "350",
                                "rating": "7.355",
                            },
                            "goals": {"total": 6, "assists": 1},
                            "cards": {"yellow": 0},
                        },
                        {
                            # duplicate player/category should be ignored
                            "team": {"id": 202},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                    ],
                },
                {
                    # missing player id should be skipped
                    "player": {},
                    "statistics": [
                        {
                            "team": {"id": 203},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 7},
                        }
                    ],
                },
                {
                    "player": {"id": 102},
                    "statistics": [
                        {
                            # missing team id should be skipped
                            "team": {},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 7},
                        },
                        {
                            # wrong league should be skipped
                            "team": {"id": 204},
                            "league": {"id": 999, "season": "2024"},
                            "games": {},
                            "goals": {"total": 7},
                        },
                        {
                            # wrong season should be skipped
                            "team": {"id": 205},
                            "league": {"id": 39, "season": "2023"},
                            "games": {},
                            "goals": {"total": 7},
                        },
                    ],
                },
            ]
        },
        "/players/topassists": {
            "response": [
                {
                    "player": {"id": 103},
                    "statistics": [
                        {
                            "team": {"id": 206},
                            "league": {"id": 39, "season": 2024},
                            "games": {
                                "appearences": "",
                                "minutes": None,
                                "rating": "bad",
                            },
                            "goals": {"assists": 4},
                        }
                    ],
                }
            ]
        },
        "/players/topyellowcards": {
            "response": [
                {
                    "player": {"id": 104},
                    "statistics": [
                        {
                            "team": {"id": 207},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "cards": {"yellow": 2},
                        }
                    ],
                }
            ]
        },
    }

    football_get = mocker.patch.object(
        service,
        "football_get",
        side_effect=lambda endpoint, params: responses[endpoint],
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert football_get.call_count == 3
    football_get.assert_any_call(
        "/players/topscorers",
        {"league": 39, "season": "2024"},
    )
    football_get.assert_any_call(
        "/players/topassists",
        {"league": 39, "season": "2024"},
    )
    football_get.assert_any_call(
        "/players/topyellowcards",
        {"league": 39, "season": "2024"},
    )

    assert len(rows) == 3

    goals_row = rows[0]
    assert goals_row.external_player_id == 101
    assert goals_row.external_team_id == 201
    assert goals_row.category == "goals"
    assert goals_row.rank == 1
    assert goals_row.value == 6
    assert goals_row.appearances == 4
    assert goals_row.minutes_played == 350
    assert goals_row.rating == 7.36

    assists_row = rows[1]
    assert assists_row.external_player_id == 103
    assert assists_row.external_team_id == 206
    assert assists_row.category == "assists"
    assert assists_row.rank == 1
    assert assists_row.value == 4
    assert assists_row.appearances is None
    assert assists_row.minutes_played is None
    assert assists_row.rating is None

    yellow_cards_row = rows[2]
    assert yellow_cards_row.external_player_id == 104
    assert yellow_cards_row.external_team_id == 207
    assert yellow_cards_row.category == "yellow_cards"
    assert yellow_cards_row.rank == 1
    assert yellow_cards_row.value == 2


def test_fetch_player_leaderboards_continues_after_invalid_statistics_row(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service,
        "API_FOOTBALL_LEADERBOARD_ENDPOINTS",
        {"goals": "/players/topscorers"},
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        },
                    ],
                }
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 1
    assert rows[0].external_player_id == 101
    assert rows[0].external_team_id == 201
    assert rows[0].value == 6


def test_fetch_player_leaderboards_continues_after_missing_team_id(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service, "API_FOOTBALL_LEADERBOARD_ENDPOINTS", {"goals": "/players/topscorers"}
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        },
                    ],
                }
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 1
    assert rows[0].external_team_id == 201
    assert rows[0].value == 6


def test_fetch_player_leaderboards_continues_after_wrong_league(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service, "API_FOOTBALL_LEADERBOARD_ENDPOINTS", {"goals": "/players/topscorers"}
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 200},
                            "league": {"id": 999, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        },
                    ],
                }
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 1
    assert rows[0].external_team_id == 201
    assert rows[0].value == 6


def test_fetch_player_leaderboards_continues_after_wrong_season(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service, "API_FOOTBALL_LEADERBOARD_ENDPOINTS", {"goals": "/players/topscorers"}
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 200},
                            "league": {"id": 39, "season": "2023"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        },
                    ],
                }
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 1
    assert rows[0].external_team_id == 201
    assert rows[0].value == 6


def test_fetch_player_leaderboards_continues_after_duplicate_player_category(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service, "API_FOOTBALL_LEADERBOARD_ENDPOINTS", {"goals": "/players/topscorers"}
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        },
                        {
                            "team": {"id": 202},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                        {
                            "team": {"id": 203},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 88},
                        },
                    ],
                },
                {
                    "player": {"id": 102},
                    "statistics": [
                        {
                            "team": {"id": 204},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 5},
                        },
                    ],
                },
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 2
    assert [row.external_player_id for row in rows] == [101, 102]
    assert [row.external_team_id for row in rows] == [201, 204]
    assert [row.value for row in rows] == [6, 5]


def test_fetch_player_leaderboards_continues_after_missing_player_id(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service, "API_FOOTBALL_LEADERBOARD_ENDPOINTS", {"goals": "/players/topscorers"}
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {},
                    "statistics": [
                        {
                            "team": {"id": 200},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        }
                    ],
                },
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        }
                    ],
                },
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 1
    assert rows[0].external_player_id == 101
    assert rows[0].external_team_id == 201


def test_fetch_player_leaderboards_continues_after_duplicate_leaderboard_key(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service,
        "API_FOOTBALL_LEADERBOARD_ENDPOINTS",
        {"goals": "/players/topscorers"},
    )
    mocker.patch.object(
        service,
        "football_get",
        return_value={
            "response": [
                {
                    "player": {"id": 101},
                    "statistics": [
                        {
                            "team": {"id": 201},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 6},
                        },
                        {
                            # duplicate key; must be skipped, not break the stats loop
                            "team": {"id": 202},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 99},
                        },
                        {
                            # also duplicate key; if duplicate continue mutates to break,
                            # this branch proves the loop stopped too early only if there is
                            # a later different player in the same response? No, same player
                            # key is still duplicate, so it won't append either way.
                            "team": {"id": 203},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 88},
                        },
                    ],
                },
                {
                    "player": {"id": 102},
                    "statistics": [
                        {
                            "team": {"id": 204},
                            "league": {"id": 39, "season": "2024"},
                            "games": {},
                            "goals": {"total": 5},
                        }
                    ],
                },
            ]
        },
    )

    rows = service.fetch_player_leaderboards_for_tournament(tournament)

    assert len(rows) == 2
    assert [row.external_player_id for row in rows] == [101, 102]
    assert [row.external_team_id for row in rows] == [201, 204]


def test_fetch_player_leaderboards_for_tournament_handles_missing_response(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        service,
        "API_FOOTBALL_LEADERBOARD_ENDPOINTS",
        {"goals": "/players/topscorers"},
    )
    mocker.patch.object(service, "football_get", return_value={})

    assert service.fetch_player_leaderboards_for_tournament(tournament) == []


def test_refresh_player_leaderboards_updates_rows_and_completes_success(mocker):
    db = object()
    tournament = make_tournament()

    create_job = mocker.patch.object(
        service.refresh_jobs_repo,
        "create_job",
        return_value=123,
    )
    complete_job = mocker.patch.object(service.refresh_jobs_repo, "complete_job")
    mocker.patch.object(
        service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )

    rows = [object(), object()]
    fetch = mocker.patch.object(
        service,
        "fetch_player_leaderboards_for_tournament",
        return_value=rows,
    )
    update = mocker.patch.object(
        service.player_leaderboards_service,
        "update_player_leaderboards",
    )

    result = service.refresh_player_leaderboards(db)

    create_job.assert_called_once_with(db, JobName.PLAYER_LEADERBOARDS_REFRESH)
    fetch.assert_called_once_with(tournament)
    update.assert_called_once_with(db, tournament.id, rows)
    complete_job.assert_called_once_with(db, 123, success=True)

    assert result["resource_name"] == "Player Leaderboards"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 2
    assert result["failures"] == []


def test_refresh_player_leaderboards_skips_empty_rows(mocker):
    db = object()
    tournament = make_tournament()

    mocker.patch.object(service.refresh_jobs_repo, "create_job", return_value=123)
    complete_job = mocker.patch.object(service.refresh_jobs_repo, "complete_job")
    mocker.patch.object(
        service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch.object(
        service,
        "fetch_player_leaderboards_for_tournament",
        return_value=[],
    )
    update = mocker.patch.object(
        service.player_leaderboards_service,
        "update_player_leaderboards",
    )

    result = service.refresh_player_leaderboards(db)

    update.assert_not_called()
    complete_job.assert_called_once_with(db, 123, success=True)

    assert result["tournaments_checked"] == 1
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == []


def test_refresh_player_leaderboards_continues_after_empty_tournament(mocker):
    db = object()
    empty_tournament = make_tournament(tournament_id=1, external_api_id=39, season="2024")
    populated_tournament = make_tournament(tournament_id=2, external_api_id=40, season="2025")

    mocker.patch.object(service.refresh_jobs_repo, "create_job", return_value=123)
    complete_job = mocker.patch.object(service.refresh_jobs_repo, "complete_job")

    get_tournaments = mocker.patch.object(
        service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[empty_tournament, populated_tournament],
    )

    populated_rows = [object(), object()]

    fetch = mocker.patch.object(
        service,
        "fetch_player_leaderboards_for_tournament",
        side_effect=[[], populated_rows],
    )
    update = mocker.patch.object(
        service.player_leaderboards_service,
        "update_player_leaderboards",
    )

    result = service.refresh_player_leaderboards(db)

    get_tournaments.assert_called_once_with(db, margin_days=0)
    assert fetch.call_count == 2
    update.assert_called_once_with(db, populated_tournament.id, populated_rows)
    complete_job.assert_called_once_with(db, 123, success=True)

    assert result["tournaments_checked"] == 2
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 2
    assert result["failures"] == []


def test_refresh_player_leaderboards_records_tournament_failure_and_preserves_job(mocker):
    db = object()
    good_tournament = make_tournament(tournament_id=1, external_api_id=39, season="2024")
    bad_tournament = make_tournament(tournament_id=2, external_api_id=40, season="2025")

    mocker.patch.object(service.refresh_jobs_repo, "create_job", return_value=123)
    complete_job = mocker.patch.object(service.refresh_jobs_repo, "complete_job")
    mocker.patch.object(
        service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[bad_tournament, good_tournament],
    )

    good_rows = [object()]

    def fetch_side_effect(tournament):
        if tournament.id == bad_tournament.id:
            raise RuntimeError("api exploded")
        return good_rows

    mocker.patch.object(
        service,
        "fetch_player_leaderboards_for_tournament",
        side_effect=fetch_side_effect,
    )
    update = mocker.patch.object(
        service.player_leaderboards_service,
        "update_player_leaderboards",
    )

    result = service.refresh_player_leaderboards(db)

    update.assert_called_once_with(db, good_tournament.id, good_rows)
    complete_job.assert_called_once_with(db, 123, success=False)

    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == [
        {
            "tournament_id": 2,
            "external_api_id": 40,
            "season": "2025",
            "reason": "api exploded",
        }
    ]


def test_refresh_player_leaderboards_marks_job_failed_when_tournament_loading_fails(mocker):
    db = object()

    mocker.patch.object(service.refresh_jobs_repo, "create_job", return_value=123)
    complete_job = mocker.patch.object(service.refresh_jobs_repo, "complete_job")
    mocker.patch.object(
        service.tournaments_service,
        "get_refreshable_tournaments",
        side_effect=RuntimeError("db unavailable"),
    )
    update = mocker.patch.object(
        service.player_leaderboards_service,
        "update_player_leaderboards",
    )

    with pytest.raises(RuntimeError, match="db unavailable"):
        service.refresh_player_leaderboards(db)

    update.assert_not_called()
    complete_job.assert_called_once_with(db, 123, success=False)
