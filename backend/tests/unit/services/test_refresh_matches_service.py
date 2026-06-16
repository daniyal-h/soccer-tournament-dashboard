from datetime import date, datetime, timezone
from unittest.mock import Mock

import pytest

from app.api.v1.services import refresh_matches as refresh_matches_service
from app.constants.external_apis import API_FOOTBALL_FIXTURES_ENDPOINT
from app.models.enums import JobName
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


def mock_refresh_job_lifecycle(mocker, job_id: int = 123):
    create_job = mocker.patch.object(
        refresh_matches_service.refresh_jobs_repo,
        "create_job",
        return_value=job_id,
    )
    complete_job = mocker.patch.object(
        refresh_matches_service.refresh_jobs_repo,
        "complete_job",
    )

    return create_job, complete_job


def make_fixture_row(
    *,
    fixture_id: int = 1234029,
    round_name: str = "Group Stage - 1",
    status_short: str = "NS",
    home_goals: int | None = None,
    away_goals: int | None = None,
    home_penalties: int | None = None,
    away_penalties: int | None = None,
) -> dict:
    return {
        "fixture": {
            "id": fixture_id,
            "date": "2024-07-14T00:00:00+00:00",
            "venue": {
                "name": "Bank of America Stadium",
                "city": "Charlotte, North Carolina",
            },
            "status": {
                "short": status_short,
                "elapsed": 120 if status_short == "PEN" else None,
            },
        },
        "league": {
            "round": round_name,
        },
        "teams": {
            "home": {"id": 5529},
            "away": {"id": 7},
        },
        "goals": {
            "home": home_goals,
            "away": away_goals,
        },
        "score": {
            "penalty": {
                "home": home_penalties,
                "away": away_penalties,
            }
        },
    }


def test_map_fixture_status_maps_scheduled_status():
    assert refresh_matches_service.map_fixture_status({"short": "NS"}) == "scheduled"


def test_map_fixture_status_maps_live_status(mocker):
    mocker.patch.object(
        refresh_matches_service,
        "LIVE_STATUS_SHORT_CODES",
        {"1H"},
    )

    assert refresh_matches_service.map_fixture_status({"short": "1h"}) == "live"


def test_map_fixture_status_maps_finished_status(mocker):
    mocker.patch.object(
        refresh_matches_service,
        "FINISHED_STATUS_SHORT_CODES",
        {"FT", "PEN"},
    )

    assert refresh_matches_service.map_fixture_status({"short": "PEN"}) == "finished"


def test_map_fixture_status_maps_postponed_status(mocker):
    mocker.patch.object(
        refresh_matches_service,
        "POSTPONED_STATUS_SHORT_CODES",
        {"PST"},
    )

    assert refresh_matches_service.map_fixture_status({"short": "pst"}) == "postponed"


def test_map_fixture_status_maps_cancelled_status(mocker):
    mocker.patch.object(
        refresh_matches_service,
        "CANCELLED_STATUS_SHORT_CODES",
        {"CANC"},
    )

    assert refresh_matches_service.map_fixture_status({"short": "canc"}) == "cancelled"


def test_map_fixture_status_defaults_unknown_status_to_scheduled():
    assert refresh_matches_service.map_fixture_status({"short": "ALIEN"}) == "scheduled"
    assert refresh_matches_service.map_fixture_status({}) == "scheduled"


def test_map_fixture_stage_maps_known_rounds():
    assert refresh_matches_service.map_fixture_stage("Group Stage - 1") == "group"
    assert refresh_matches_service.map_fixture_stage("Round of 32") == "round_of_32"
    assert refresh_matches_service.map_fixture_stage("Round of 16") == "round_of_16"
    assert refresh_matches_service.map_fixture_stage("Quarter-finals") == "quarter_final"
    assert refresh_matches_service.map_fixture_stage("Semi-finals") == "semi_final"
    assert refresh_matches_service.map_fixture_stage("3rd Place Final") == "third_place"
    assert refresh_matches_service.map_fixture_stage("Final") == "final"


def test_map_fixture_stage_normalizes_whitespace_and_case():
    assert refresh_matches_service.map_fixture_stage("  GROUP STAGE - 1  ") == "group"
    assert refresh_matches_service.map_fixture_stage("  ROUND OF 32  ") == "round_of_32"
    assert refresh_matches_service.map_fixture_stage("  ROUND OF 16  ") == "round_of_16"
    assert refresh_matches_service.map_fixture_stage("  QUARTER-FINALS  ") == "quarter_final"
    assert refresh_matches_service.map_fixture_stage("  SEMI-FINALS  ") == "semi_final"
    assert refresh_matches_service.map_fixture_stage("  3RD PLACE FINAL  ") == "third_place"
    assert refresh_matches_service.map_fixture_stage("THIRD PLACE FINAL") == "third_place"


def test_map_fixture_stage_only_maps_final_when_final_is_standalone_or_suffix():
    assert refresh_matches_service.map_fixture_stage("Final") == "final"
    assert refresh_matches_service.map_fixture_stage("Gold Cup Final") == "final"
    assert refresh_matches_service.map_fixture_stage("Final Round") == "other"


def test_map_fixture_status_normalizes_whitespace_and_case():
    assert refresh_matches_service.map_fixture_status({"short": " ns "}) == "scheduled"
    assert refresh_matches_service.map_fixture_status({"short": " 1h "}) == "live"
    assert refresh_matches_service.map_fixture_status({"short": " ft "}) == "finished"
    assert refresh_matches_service.map_fixture_status({"short": " pst "}) == "postponed"
    assert refresh_matches_service.map_fixture_status({"short": " canc "}) == "cancelled"


def test_map_fixture_status_defaults_blank_or_none_short_to_scheduled():
    assert refresh_matches_service.map_fixture_status({"short": ""}) == "scheduled"
    assert refresh_matches_service.map_fixture_status({"short": "   "}) == "scheduled"
    assert refresh_matches_service.map_fixture_status({"short": None}) == "scheduled"


def test_map_fixture_stage_maps_unknown_or_missing_round_to_other():
    assert refresh_matches_service.map_fixture_stage("Some Weird Round") == "other"
    assert refresh_matches_service.map_fixture_stage(None) == "other"


def test_transform_fixture_maps_fixture_fields_with_penalties():
    row = make_fixture_row(
        round_name="3rd Place Final",
        status_short="PEN",
        home_goals=2,
        away_goals=2,
        home_penalties=3,
        away_penalties=4,
    )

    result = refresh_matches_service.transform_fixture(row)

    assert result.external_api_id == 1234029
    assert result.external_team_a_id == 5529
    assert result.external_team_b_id == 7
    assert result.kickoff_time == datetime(2024, 7, 14, 0, 0, tzinfo=timezone.utc)
    assert result.stage == "third_place"
    assert result.status == "finished"
    assert result.venue == "Bank of America Stadium"
    assert result.city == "Charlotte, North Carolina"
    assert result.elapsed == 120
    assert result.team_a_score == 2
    assert result.team_b_score == 2
    assert result.team_a_penalties == 3
    assert result.team_b_penalties == 4


def test_transform_fixture_preserves_zero_penalties():
    row = make_fixture_row(
        status_short="PEN",
        home_goals=0,
        away_goals=0,
        home_penalties=0,
        away_penalties=2,
    )

    result = refresh_matches_service.transform_fixture(row)

    assert result.team_a_score == 0
    assert result.team_b_score == 0
    assert result.team_a_penalties == 0
    assert result.team_b_penalties == 2


def test_transform_fixture_defaults_missing_optional_nested_values_to_none():
    row = {
        "fixture": {
            "id": 123,
            "date": "2024-07-14T00:00:00+00:00",
            "venue": None,
            "status": {},
        },
        "league": {
            "round": None,
        },
        "teams": {
            "home": {"id": 1},
            "away": {"id": 2},
        },
        "goals": None,
        "score": None,
    }

    result = refresh_matches_service.transform_fixture(row)

    assert result.external_api_id == 123
    assert result.external_team_a_id == 1
    assert result.external_team_b_id == 2
    assert result.stage == "other"
    assert result.status == "scheduled"
    assert result.venue is None
    assert result.city is None
    assert result.elapsed is None
    assert result.team_a_score is None
    assert result.team_b_score is None
    assert result.team_a_penalties is None
    assert result.team_b_penalties is None


def test_transform_fixture_handles_missing_status_object():
    row = make_fixture_row()
    del row["fixture"]["status"]

    result = refresh_matches_service.transform_fixture(row)

    assert result.status == "scheduled"
    assert result.elapsed is None


def test_fetch_matches_for_tournament_calls_football_api_with_expected_params(mocker):
    tournament = make_tournament()
    football_get = mocker.patch.object(
        refresh_matches_service,
        "football_get",
        return_value={"response": [make_fixture_row()]},
    )

    rows = refresh_matches_service.fetch_matches_for_tournament(tournament)

    football_get.assert_called_once_with(
        API_FOOTBALL_FIXTURES_ENDPOINT,
        {
            "league": 9,
            "season": "2024",
        },
    )

    assert len(rows) == 1
    assert rows[0].external_api_id == 1234029


def test_fetch_matches_for_tournament_returns_empty_list_when_api_has_no_response(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        refresh_matches_service,
        "football_get",
        return_value={"response": []},
    )

    rows = refresh_matches_service.fetch_matches_for_tournament(tournament)

    assert rows == []


def test_fetch_matches_for_tournament_returns_empty_list_when_response_key_missing(mocker):
    tournament = make_tournament()

    mocker.patch.object(
        refresh_matches_service,
        "football_get",
        return_value={},
    )

    rows = refresh_matches_service.fetch_matches_for_tournament(tournament)

    assert rows == []


def test_refresh_matches_updates_each_tournament_and_returns_success_summary(mocker):
    db = Mock()
    create_job, complete_job = mock_refresh_job_lifecycle(mocker)
    tournament_a = make_tournament(tournament_id=1, external_api_id=9, season="2024")
    tournament_b = make_tournament(tournament_id=2, external_api_id=4, season="2024")

    rows_a = [Mock(), Mock()]
    rows_b = [Mock()]

    get_refreshable_tournaments = mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament_a, tournament_b],
    )
    fetch_matches = mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
        side_effect=[rows_a, rows_b],
    )
    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
    )

    result = refresh_matches_service.refresh_matches(db, margin_days=7)

    create_job.assert_called_once_with(db, JobName.MATCHES_REFRESH)
    complete_job.assert_called_once_with(db, 123, success=True)
    get_refreshable_tournaments.assert_called_once_with(db, 7)
    assert fetch_matches.call_args_list == [
        mocker.call(tournament_a),
        mocker.call(tournament_b),
    ]
    assert update_matches.call_args_list == [
        mocker.call(db, 1, rows_a),
        mocker.call(db, 2, rows_b),
    ]

    assert result["message"] == "Matches refresh completed"
    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 2
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 3
    assert result["failures"] == []


def test_refresh_matches_skips_tournament_when_api_returns_no_rows(mocker):
    db = Mock()
    create_job, complete_job = mock_refresh_job_lifecycle(mocker)
    tournament = make_tournament()

    mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
        return_value=[],
    )
    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
    )

    result = refresh_matches_service.refresh_matches(db, margin_days=1)

    create_job.assert_called_once_with(db, JobName.MATCHES_REFRESH)
    complete_job.assert_called_once_with(db, 123, success=True)
    update_matches.assert_not_called()

    assert result["message"] == "Matches refresh completed"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["tournaments_skipped"] == 1
    assert result["rows_processed"] == 0
    assert result["failures"] == []


def test_refresh_matches_continues_after_skipped_tournament(mocker):
    db = Mock()
    mock_refresh_job_lifecycle(mocker)

    tournament_a = make_tournament(tournament_id=1)
    tournament_b = make_tournament(tournament_id=2)

    mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament_a, tournament_b],
    )

    mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
        side_effect=[[], ["match"]],
    )

    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
    )

    result = refresh_matches_service.refresh_matches(db)

    update_matches.assert_called_once_with(db, 2, ["match"])

    assert result["tournaments_checked"] == 2
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 1


def test_refresh_matches_records_fetch_failure_and_continues_with_next_tournament(mocker):
    db = Mock()
    create_job, complete_job = mock_refresh_job_lifecycle(mocker)
    failing_tournament = make_tournament(tournament_id=1, external_api_id=9, season="2024")
    successful_tournament = make_tournament(tournament_id=2, external_api_id=4, season="2024")

    successful_rows = [Mock(), Mock(), Mock()]

    mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[failing_tournament, successful_tournament],
    )
    fetch_matches = mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
        side_effect=[RuntimeError("API failed"), successful_rows],
    )
    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
    )

    result = refresh_matches_service.refresh_matches(db, margin_days=1)

    create_job.assert_called_once_with(db, JobName.MATCHES_REFRESH)
    complete_job.assert_called_once_with(db, 123, success=False)
    assert fetch_matches.call_args_list == [
        mocker.call(failing_tournament),
        mocker.call(successful_tournament),
    ]
    update_matches.assert_called_once_with(db, 2, successful_rows)

    assert result["message"] == "Matches refresh completed with failures"
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


def test_refresh_matches_records_update_failure_and_does_not_mark_refreshed(mocker):
    db = Mock()
    create_job, complete_job = mock_refresh_job_lifecycle(mocker)
    tournament = make_tournament()
    rows = [Mock(), Mock()]

    mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[tournament],
    )
    mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
        return_value=rows,
    )
    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
        side_effect=RuntimeError("database failed"),
    )

    result = refresh_matches_service.refresh_matches(db, margin_days=1)

    create_job.assert_called_once_with(db, JobName.MATCHES_REFRESH)
    complete_job.assert_called_once_with(db, 123, success=False)
    update_matches.assert_called_once_with(db, 1, rows)

    assert result["message"] == "Matches refresh completed with failures"
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


def test_refresh_matches_returns_empty_summary_when_no_tournaments_are_refreshable(mocker):
    db = Mock()
    create_job, complete_job = mock_refresh_job_lifecycle(mocker)

    mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        return_value=[],
    )
    fetch_matches = mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
    )
    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
    )

    result = refresh_matches_service.refresh_matches(db, margin_days=1)

    create_job.assert_called_once_with(db, JobName.MATCHES_REFRESH)
    complete_job.assert_called_once_with(db, 123, success=True)
    fetch_matches.assert_not_called()
    update_matches.assert_not_called()

    assert result["message"] == "Matches refresh completed"
    assert result["tournaments_checked"] == 0
    assert result["tournaments_refreshed"] == 0
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == []


def test_refresh_matches_marks_job_failed_and_reraises_when_command_fails(mocker):
    db = Mock()
    create_job, complete_job = mock_refresh_job_lifecycle(mocker, job_id=456)

    mocker.patch.object(
        refresh_matches_service.tournaments_service,
        "get_refreshable_tournaments",
        side_effect=RuntimeError("tournament lookup failed"),
    )
    fetch_matches = mocker.patch.object(
        refresh_matches_service,
        "fetch_matches_for_tournament",
    )
    update_matches = mocker.patch.object(
        refresh_matches_service.matches_service,
        "update_matches",
    )

    with pytest.raises(RuntimeError, match="tournament lookup failed"):
        refresh_matches_service.refresh_matches(db, margin_days=1)

    create_job.assert_called_once_with(db, JobName.MATCHES_REFRESH)
    complete_job.assert_called_once_with(db, 456, success=False)
    fetch_matches.assert_not_called()
    update_matches.assert_not_called()
