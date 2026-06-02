from datetime import date
from unittest.mock import Mock

from app.api.v1.services import refresh_standings as refresh_standings_service
from app.constants.external_apis import API_FOOTBALL_STANDINGS_ENDPOINT
from app.models.tournament import Tournament


def make_tournament(
    *,
    tournament_id: int = 1,
    external_api_id: int = 9,
    season: str = "2024",
) -> Tournament:
    return Tournament(
        id=tournament_id,
        external_api_id=external_api_id,
        name="Copa America",
        season=season,
        logo_url=None,
        start_date=date(2024, 6, 21),
        end_date=date(2024, 7, 15),
    )


def make_api_response() -> dict:
    return {
        "league": {
            "standings": [
                [
                    {
                        "rank": 1,
                        "points": 9,
                        "group": "Group A",
                        "team": {"id": 10},
                        "all": {
                            "win": 3,
                            "draw": 0,
                            "lose": 0,
                            "goals": {"for": 6, "against": 1},
                        },
                    },
                    {
                        "rank": 2,
                        "points": 4,
                        "group": "Group A",
                        "team": {"id": 20},
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


def test_transform_standings_response_maps_valid_group_rows():
    rows = refresh_standings_service.transform_standings_response(make_api_response())

    assert len(rows) == 2

    assert rows[0].external_team_id == 10
    assert rows[0].group == "A"
    assert rows[0].position == 1
    assert rows[0].points == 9
    assert rows[0].wins == 3
    assert rows[0].draws == 0
    assert rows[0].losses == 0
    assert rows[0].goals_for == 6
    assert rows[0].goals_against == 1

    assert rows[1].external_team_id == 20
    assert rows[1].group == "A"
    assert rows[1].position == 2
    assert rows[1].points == 4


def test_transform_standings_response_skips_non_single_letter_groups():
    response = {
        "league": {
            "standings": [
                [
                    {
                        "rank": 1,
                        "points": 3,
                        "group": "Ranking of third-placed teams",
                        "team": {"id": 10},
                        "all": {
                            "win": 1,
                            "draw": 0,
                            "lose": 0,
                            "goals": {"for": 2, "against": 0},
                        },
                    },
                    {
                        "rank": 2,
                        "points": 3,
                        "group": "Group B",
                        "team": {"id": 20},
                        "all": {
                            "win": 1,
                            "draw": 0,
                            "lose": 0,
                            "goals": {"for": 1, "against": 0},
                        },
                    },
                    {
                        "rank": 3,
                        "points": 1,
                        "group": "Group AB",
                        "team": {"id": 30},
                        "all": {
                            "win": 0,
                            "draw": 1,
                            "lose": 1,
                            "goals": {"for": 1, "against": 2},
                        },
                    },
                ]
            ]
        }
    }

    rows = refresh_standings_service.transform_standings_response(response)

    assert len(rows) == 1
    assert rows[0].external_team_id == 20
    assert rows[0].group == "B"


def test_transform_standings_response_defaults_missing_numeric_values_to_zero():
    response = {
        "league": {
            "standings": [
                [
                    {
                        "rank": None,
                        "points": None,
                        "group": "Group C",
                        "team": {"id": 30},
                        "all": {},
                    }
                ]
            ]
        }
    }

    rows = refresh_standings_service.transform_standings_response(response)

    assert len(rows) == 1
    assert rows[0].external_team_id == 30
    assert rows[0].group == "C"
    assert rows[0].position == 0
    assert rows[0].points == 0
    assert rows[0].wins == 0
    assert rows[0].draws == 0
    assert rows[0].losses == 0
    assert rows[0].goals_for == 0
    assert rows[0].goals_against == 0


def test_transform_standings_response_returns_empty_list_when_no_standings_groups():
    response = {"league": {"standings": []}}

    rows = refresh_standings_service.transform_standings_response(response)

    assert rows == []


def test_get_standings_for_tournament_calls_football_api_with_expected_params(mocker):
    tournament = make_tournament()
    football_get = mocker.patch.object(
        refresh_standings_service,
        "football_get",
        return_value={"response": [make_api_response()]},
    )

    rows = refresh_standings_service.get_standings_for_tournament(tournament)

    football_get.assert_called_once_with(
        API_FOOTBALL_STANDINGS_ENDPOINT,
        {
            "league": 9,
            "season": "2024",
        },
    )

    assert len(rows) == 2
    assert rows[0].external_team_id == 10


def test_get_standings_for_tournament_returns_empty_list_when_api_has_no_response(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        refresh_standings_service,
        "football_get",
        return_value={"response": []},
    )

    rows = refresh_standings_service.get_standings_for_tournament(tournament)

    assert rows == []


def test_get_standings_for_tournament_returns_empty_list_when_response_key_missing(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        refresh_standings_service,
        "football_get",
        return_value={},
    )

    rows = refresh_standings_service.get_standings_for_tournament(tournament)

    assert rows == []


def test_refresh_standings_updates_each_tournament_and_returns_success_summary(mocker):
    db = Mock()
    tournament_a = make_tournament(tournament_id=1, external_api_id=9, season="2024")
    tournament_b = make_tournament(tournament_id=2, external_api_id=4, season="2024")

    rows_a = [Mock(), Mock()]
    rows_b = [Mock()]

    get_refreshable_tournaments = mocker.patch.object(
        refresh_standings_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament_a, tournament_b],
    )
    get_standings = mocker.patch.object(
        refresh_standings_service,
        "get_standings_for_tournament",
        side_effect=[rows_a, rows_b],
    )
    update_standings = mocker.patch.object(
        refresh_standings_service.standings_service,
        "update_standings",
    )

    result = refresh_standings_service.refresh_standings(db, margin_days=7)

    get_refreshable_tournaments.assert_called_once_with(db, 7)
    assert get_standings.call_args_list == [
        mocker.call(tournament_a),
        mocker.call(tournament_b),
    ]
    assert update_standings.call_args_list == [
        mocker.call(db, 1, rows_a),
        mocker.call(db, 2, rows_b),
    ]

    assert result["message"] == "Standings refresh completed"
    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 2
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 3
    assert result["failures"] == []


def test_refresh_standings_skips_tournament_when_api_returns_no_rows(mocker):
    db = Mock()
    tournament = make_tournament()

    mocker.patch.object(
        refresh_standings_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch.object(
        refresh_standings_service,
        "get_standings_for_tournament",
        return_value=[],
    )
    update_standings = mocker.patch.object(
        refresh_standings_service.standings_service,
        "update_standings",
    )

    result = refresh_standings_service.refresh_standings(db, margin_days=1)

    update_standings.assert_not_called()

    assert result["message"] == "Standings refresh completed"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["tournaments_skipped"] == 1
    assert result["rows_processed"] == 0
    assert result["failures"] == []


def test_refresh_standings_records_failure_and_continues_with_next_tournament(mocker):
    db = Mock()
    failing_tournament = make_tournament(tournament_id=1, external_api_id=9, season="2024")
    successful_tournament = make_tournament(tournament_id=2, external_api_id=4, season="2024")

    successful_rows = [Mock(), Mock(), Mock()]

    mocker.patch.object(
        refresh_standings_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[failing_tournament, successful_tournament],
    )
    get_standings = mocker.patch.object(
        refresh_standings_service,
        "get_standings_for_tournament",
        side_effect=[RuntimeError("API failed"), successful_rows],
    )
    update_standings = mocker.patch.object(
        refresh_standings_service.standings_service,
        "update_standings",
    )

    result = refresh_standings_service.refresh_standings(db, margin_days=1)

    assert get_standings.call_args_list == [
        mocker.call(failing_tournament),
        mocker.call(successful_tournament),
    ]
    update_standings.assert_called_once_with(db, 2, successful_rows)

    assert result["message"] == "Standings refresh completed with failures"
    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 1
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 3
    assert result["failures"] == [
        {
            "tournament_id": 1,
            "external_api_id": 9,
            "season": "2024",
            "reason": "API failed",
        }
    ]


def test_refresh_standings_records_update_failure_and_does_not_mark_refreshed(mocker):
    db = Mock()
    tournament = make_tournament()
    rows = [Mock(), Mock()]

    mocker.patch.object(
        refresh_standings_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch.object(
        refresh_standings_service,
        "get_standings_for_tournament",
        return_value=rows,
    )
    update_standings = mocker.patch.object(
        refresh_standings_service.standings_service,
        "update_standings",
        side_effect=RuntimeError("database failed"),
    )

    result = refresh_standings_service.refresh_standings(db, margin_days=1)

    update_standings.assert_called_once_with(db, 1, rows)

    assert result["message"] == "Standings refresh completed with failures"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == [
        {
            "tournament_id": 1,
            "external_api_id": 9,
            "season": "2024",
            "reason": "database failed",
        }
    ]


def test_refresh_standings_returns_empty_summary_when_no_tournaments_are_refreshable(mocker):
    db = Mock()

    mocker.patch.object(
        refresh_standings_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[],
    )
    get_standings = mocker.patch.object(
        refresh_standings_service,
        "get_standings_for_tournament",
    )
    update_standings = mocker.patch.object(
        refresh_standings_service.standings_service,
        "update_standings",
    )

    result = refresh_standings_service.refresh_standings(db, margin_days=1)

    get_standings.assert_not_called()
    update_standings.assert_not_called()

    assert result["message"] == "Standings refresh completed"
    assert result["tournaments_checked"] == 0
    assert result["tournaments_refreshed"] == 0
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == []
