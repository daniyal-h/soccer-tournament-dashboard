from datetime import date
from types import SimpleNamespace

import pytest

from app.api.v1.services import refresh_team_squads as sut
from app.models.enums import JobName


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, None),
        ("", None),
        ("180", 180),
        ("180 cm", 180),
        (" 180 CM ", 180),
        ("cm", None),
        ("six feet", None),
        ("180.5 cm", None),
    ],
)
def test_normalize_height(value, expected):
    assert sut.normalize_height(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, None),
        ("", None),
        ("2000-01-31", date(2000, 1, 31)),
        ("2000-02-30", None),
        ("31-01-2000", None),
    ],
)
def test_parse_birth_date(value, expected):
    assert sut.parse_birth_date(value) == expected


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        (None, None),
        ("", None),
        (" Goalkeeper ", "GK"),
        ("DEFENDER", "DEF"),
        ("midfielder", "MID"),
        ("Attacker", "FWD"),
        ("Coach", None),
    ],
)
def test_map_position(value, expected):
    assert sut.map_position(value) == expected


def make_player_entry(
    *,
    player_id=10,
    player_name="Lionel Messi",
    firstname="Lionel",
    lastname="Messi",
    birth_date="1987-06-24",
    height="170 cm",
    statistics=None,
):
    return {
        "player": {
            "id": player_id,
            "name": player_name,
            "firstname": firstname,
            "lastname": lastname,
            "birth": {"date": birth_date},
            "photo": "https://example.com/player.png",
            "nationality": "Argentina",
            "height": height,
        },
        "statistics": statistics
        if statistics is not None
        else [
            {
                "team": {"id": 50},
                "league": {"id": 1, "season": 2026},
                "games": {"number": 10, "position": "Attacker"},
            }
        ],
    }


def test_transform_team_squads_row_maps_valid_player_registration():
    rows = sut.transform_team_squads_data_row(
        make_player_entry(),
        tournament_external_api_id=1,
        season="2026",
    )

    assert len(rows) == 1

    row = rows[0]
    assert row.external_player_id == 10
    assert row.external_team_id == 50
    assert row.display_name == "Lionel Messi"
    assert row.first_name == "Lionel"
    assert row.last_name == "Messi"
    assert row.date_of_birth == date(1987, 6, 24)
    assert row.photo_url == "https://example.com/player.png"
    assert row.nationality == "Argentina"
    assert row.height == 170
    assert row.squad_number == 10
    assert row.position == "FWD"


def test_transform_team_squads_row_uses_safe_defaults_for_optional_player_fields():
    rows = sut.transform_team_squads_data_row(
        make_player_entry(
            player_name=None,
            firstname=None,
            lastname=None,
            birth_date="not-a-date",
            height="not-height",
            statistics=[
                {
                    "team": {"id": 99},
                    "league": {"id": 1, "season": "2026"},
                    "games": {"number": None, "position": "unknown"},
                }
            ],
        ),
        tournament_external_api_id=1,
        season="2026",
    )

    assert len(rows) == 1
    row = rows[0]

    assert row.display_name == "Unknown Player"
    assert row.first_name is None
    assert row.last_name is None
    assert row.date_of_birth is None
    assert row.height is None
    assert row.squad_number is None
    assert row.position is None


@pytest.mark.parametrize(
    "entry",
    [
        {},
        {"player": None},
        {"player": {}},
        {"player": {"id": None}},
        {"player": {"id": 10}, "statistics": []},
        {"player": {"id": 10}, "statistics": None},
    ],
)
def test_transform_team_squads_row_returns_empty_for_missing_required_data(entry):
    assert (
        sut.transform_team_squads_data_row(
            entry,
            tournament_external_api_id=1,
            season="2026",
        )
        == []
    )


def test_transform_team_squads_row_filters_wrong_team_league_and_season_rows():
    rows = sut.transform_team_squads_data_row(
        make_player_entry(
            statistics=[
                {
                    "team": {},
                    "league": {"id": 1, "season": 2026},
                    "games": {"number": 1, "position": "Goalkeeper"},
                },
                {
                    "team": {"id": 10},
                    "league": {"id": 999, "season": 2026},
                    "games": {"number": 2, "position": "Defender"},
                },
                {
                    "team": {"id": 20},
                    "league": {"id": 1, "season": 2025},
                    "games": {"number": 3, "position": "Midfielder"},
                },
                {
                    "team": {"id": 30},
                    "league": {"id": 1, "season": "2026"},
                    "games": {"number": 4, "position": "Attacker"},
                },
            ],
        ),
        tournament_external_api_id=1,
        season="2026",
    )

    assert len(rows) == 1
    assert rows[0].external_team_id == 30
    assert rows[0].squad_number == 4
    assert rows[0].position == "FWD"


def test_transform_team_squads_row_allows_same_player_on_multiple_matching_teams():
    rows = sut.transform_team_squads_data_row(
        make_player_entry(
            player_id=77,
            statistics=[
                {
                    "team": {"id": 10},
                    "league": {"id": 1, "season": 2026},
                    "games": {"number": 7, "position": "Midfielder"},
                },
                {
                    "team": {"id": 20},
                    "league": {"id": 1, "season": "2026"},
                    "games": {"number": 8, "position": "Defender"},
                },
            ],
        ),
        tournament_external_api_id=1,
        season="2026",
    )

    assert [(row.external_team_id, row.external_player_id) for row in rows] == [
        (10, 77),
        (20, 77),
    ]


def test_fetch_team_squads_data_for_tournament_paginates_and_deduplicates(mocker):
    tournament = SimpleNamespace(external_api_id=1, season="2026")

    football_get = mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        side_effect=[
            {
                "paging": {"total": 2},
                "response": [
                    make_player_entry(player_id=10),
                    make_player_entry(player_id=10),
                ],
            },
            {
                "paging": {"total": 2},
                "response": [
                    make_player_entry(
                        player_id=11,
                        player_name="Kylian Mbappe",
                        statistics=[
                            {
                                "team": {"id": 51},
                                "league": {"id": 1, "season": 2026},
                                "games": {"number": 9, "position": "Attacker"},
                            }
                        ],
                    )
                ],
            },
        ],
    )

    rows = sut.fetch_team_squads_data_for_tournament(tournament)

    assert [(row.external_team_id, row.external_player_id) for row in rows] == [
        (50, 10),
        (51, 11),
    ]

    assert football_get.call_args_list == [
        mocker.call(
            sut.API_FOOTBALL_PLAYERS_ENDPOINT,
            {"league": 1, "season": "2026", "page": 1},
        ),
        mocker.call(
            sut.API_FOOTBALL_PLAYERS_ENDPOINT,
            {"league": 1, "season": "2026", "page": 2},
        ),
    ]


def test_fetch_team_squads_data_for_tournament_defaults_missing_paging_to_single_page(mocker):
    tournament = SimpleNamespace(external_api_id=1, season="2026")

    football_get = mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        return_value={"response": [make_player_entry()]},
    )

    rows = sut.fetch_team_squads_data_for_tournament(tournament)

    assert len(rows) == 1
    football_get.assert_called_once_with(
        sut.API_FOOTBALL_PLAYERS_ENDPOINT,
        {"league": 1, "season": "2026", "page": 1},
    )


def test_fetch_team_squads_data_for_tournament_continues_after_duplicate_row(mocker):
    tournament = SimpleNamespace(external_api_id=1, season="2026")

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.football_get",
        return_value={
            "paging": {"total": 1},
            "response": [
                make_player_entry(player_id=10),
                make_player_entry(player_id=10),
                make_player_entry(
                    player_id=11,
                    player_name="Kylian Mbappe",
                    statistics=[
                        {
                            "team": {"id": 51},
                            "league": {"id": 1, "season": 2026},
                            "games": {"number": 9, "position": "Attacker"},
                        }
                    ],
                ),
            ],
        },
    )

    rows = sut.fetch_team_squads_data_for_tournament(tournament)

    assert [(row.external_team_id, row.external_player_id) for row in rows] == [
        (50, 10),
        (51, 11),
    ]


def test_refresh_team_squads_updates_rows_and_marks_job_success(mocker):
    db = object()
    tournament = SimpleNamespace(id=123, external_api_id=1, season="2026")
    row = SimpleNamespace(external_team_id=50, external_player_id=10)

    create_job = mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.create_job",
        return_value=777,
    )
    complete_job = mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.complete_job"
    )
    get_refreshable_tournaments = mocker.patch(
        "app.api.v1.services.refresh_team_squads.tournaments_service.get_refreshable_tournaments",
        return_value=[tournament],
    )
    fetch_team_squads = mocker.patch(
        "app.api.v1.services.refresh_team_squads.fetch_team_squads_data_for_tournament",
        return_value=[row],
    )
    update_team_players = mocker.patch(
        "app.api.v1.services.refresh_team_squads.team_players_service.update_team_players"
    )

    result = sut.refresh_team_squads(db, margin_days=3)

    create_job.assert_called_once_with(db, JobName.TEAM_SQUADS_REFRESH)
    get_refreshable_tournaments.assert_called_once_with(db, 3)
    fetch_team_squads.assert_called_once_with(tournament)
    update_team_players.assert_called_once_with(
        db=db,
        tournament_id=123,
        rows=[row],
    )
    complete_job.assert_called_once_with(db, 777, success=True)

    assert result["resource_name"] == "Player Data"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == []


def test_refresh_team_squads_skips_tournament_with_no_rows(mocker):
    db = object()
    tournament = SimpleNamespace(id=123, external_api_id=1, season="2026")

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.create_job",
        return_value=777,
    )
    complete_job = mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.complete_job"
    )
    mocker.patch(
        "app.api.v1.services.refresh_team_squads.tournaments_service.get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch(
        "app.api.v1.services.refresh_team_squads.fetch_team_squads_data_for_tournament",
        return_value=[],
    )
    update_team_players = mocker.patch(
        "app.api.v1.services.refresh_team_squads.team_players_service.update_team_players"
    )

    result = sut.refresh_team_squads(db)

    update_team_players.assert_not_called()
    complete_job.assert_called_once_with(db, 777, success=True)

    assert result["tournaments_checked"] == 1
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == []


def test_refresh_team_squads_records_tournament_failure_and_completes_failed_job(mocker):
    db = object()
    good_tournament = SimpleNamespace(id=1, external_api_id=10, season="2026")
    bad_tournament = SimpleNamespace(id=2, external_api_id=20, season="2027")
    row = SimpleNamespace(external_team_id=50, external_player_id=10)

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.create_job",
        return_value=777,
    )
    complete_job = mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.complete_job"
    )
    mocker.patch(
        "app.api.v1.services.refresh_team_squads.tournaments_service.get_refreshable_tournaments",
        return_value=[good_tournament, bad_tournament],
    )
    mocker.patch(
        "app.api.v1.services.refresh_team_squads.fetch_team_squads_data_for_tournament",
        side_effect=[[row], RuntimeError("API exploded")],
    )
    update_team_players = mocker.patch(
        "app.api.v1.services.refresh_team_squads.team_players_service.update_team_players"
    )

    result = sut.refresh_team_squads(db)

    update_team_players.assert_called_once_with(
        db=db,
        tournament_id=1,
        rows=[row],
    )
    complete_job.assert_called_once_with(db, 777, success=False)

    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == [
        {
            "tournament_id": 2,
            "external_api_id": 20,
            "season": "2027",
            "reason": "API exploded",
        }
    ]


def test_refresh_team_squads_completes_failed_job_and_reraises_outer_failure(mocker):
    db = object()

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.create_job",
        return_value=777,
    )
    complete_job = mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.complete_job"
    )
    mocker.patch(
        "app.api.v1.services.refresh_team_squads.tournaments_service.get_refreshable_tournaments",
        side_effect=RuntimeError("database unavailable"),
    )

    with pytest.raises(RuntimeError, match="database unavailable"):
        sut.refresh_team_squads(db)

    complete_job.assert_called_once_with(db, 777, success=False)


def test_refresh_team_squads_continues_after_skipped_tournament(mocker):
    db = object()
    skipped_tournament = SimpleNamespace(id=1, external_api_id=10, season="2026")
    refreshed_tournament = SimpleNamespace(id=2, external_api_id=20, season="2027")
    row = SimpleNamespace(external_team_id=50, external_player_id=10)

    mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.create_job",
        return_value=777,
    )
    complete_job = mocker.patch(
        "app.api.v1.services.refresh_team_squads.refresh_jobs_repo.complete_job"
    )
    mocker.patch(
        "app.api.v1.services.refresh_team_squads.tournaments_service.get_refreshable_tournaments",
        return_value=[skipped_tournament, refreshed_tournament],
    )
    fetch_team_squads = mocker.patch(
        "app.api.v1.services.refresh_team_squads.fetch_team_squads_data_for_tournament",
        side_effect=[[], [row]],
    )
    update_team_players = mocker.patch(
        "app.api.v1.services.refresh_team_squads.team_players_service.update_team_players"
    )

    result = sut.refresh_team_squads(db)

    assert fetch_team_squads.call_args_list == [
        mocker.call(skipped_tournament),
        mocker.call(refreshed_tournament),
    ]
    update_team_players.assert_called_once_with(
        db=db,
        tournament_id=2,
        rows=[row],
    )
    complete_job.assert_called_once_with(db, 777, success=True)

    assert result["tournaments_checked"] == 2
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == []
