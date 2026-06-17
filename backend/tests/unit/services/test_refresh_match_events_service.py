from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.api.v1.services import refresh_match_events as refresh_match_events_service
from app.models.enums import EventType, JobName


@pytest.fixture
def db():
    return Mock()


def make_match(match_id=1, external_api_id=9001, tournament_id=10):
    return SimpleNamespace(
        id=match_id,
        external_api_id=external_api_id,
        tournament_id=tournament_id,
    )


def make_raw_event(
    *,
    raw_type="Goal",
    detail="Normal Goal",
    elapsed=25,
    extra=None,
    team_id=1,
    player_id=11,
    player_name="Jonathan David",
    assist_id=12,
    assist_name="Alphonso Davies",
    comments="right footed shot",
):
    return {
        "time": {"elapsed": elapsed, "extra": extra},
        "team": {"id": team_id},
        "player": {"id": player_id, "name": player_name},
        "assist": {"id": assist_id, "name": assist_name},
        "type": raw_type,
        "detail": detail,
        "comments": comments,
    }


def test_normalize_trims_lowercases_and_handles_none():
    assert refresh_match_events_service.normalize("  Goal  ") == "goal"
    assert refresh_match_events_service.normalize("YELLOW CARD") == "yellow card"
    assert refresh_match_events_service.normalize(None) == ""


@pytest.mark.parametrize(
    ("raw_type", "detail", "expected"),
    [
        ("Goal", "Normal Goal", EventType.GOAL),
        ("goal", "Own Goal", EventType.OWN_GOAL),
        (" Goal ", " Penalty ", EventType.PENALTY_GOAL),
        ("Goal", "Missed Penalty", EventType.PENALTY_MISS),
        ("Card", "Yellow Card", EventType.YELLOW_CARD),
        ("Card", "Red Card", EventType.RED_CARD),
        ("subst", "Substitution 1", EventType.SUBSTITUTION),
        ("Var", "Goal cancelled", EventType.VAR),
        ("Card", "Second Yellow Card", EventType.OTHER),
        ("Foul", "Bad foul", EventType.OTHER),
        (None, None, EventType.OTHER),
    ],
)
def test_map_event_type_maps_api_values(raw_type, detail, expected):
    assert refresh_match_events_service.map_event_type(raw_type, detail) == expected


def test_transform_match_event_returns_refresh_row_with_all_fields():
    row = refresh_match_events_service.transform_match_event(
        9001,
        make_raw_event(
            raw_type="Goal",
            detail="Penalty",
            elapsed=45,
            extra=2,
            team_id=4,
            player_id=101,
            player_name="Player One",
            assist_id=202,
            assist_name="Player Two",
            comments="converted penalty",
        ),
    )

    assert row.external_match_id == 9001
    assert row.external_team_id == 4
    assert row.player_external_id == 101
    assert row.secondary_player_external_id == 202
    assert row.player_name == "Player One"
    assert row.secondary_player_name == "Player Two"
    assert row.event_type == EventType.PENALTY_GOAL
    assert row.minute == 45
    assert row.extra_minute == 2
    assert row.detail == "Penalty"
    assert row.comments == "converted penalty"


def test_transform_match_event_allows_missing_optional_player_assist_extra_and_comments():
    row = refresh_match_events_service.transform_match_event(
        9001,
        {
            "time": {"elapsed": 80},
            "team": {"id": 4},
            "player": {},
            "assist": {},
            "type": "Card",
            "detail": "Red Card",
        },
    )

    assert row.external_match_id == 9001
    assert row.external_team_id == 4
    assert row.player_external_id is None
    assert row.secondary_player_external_id is None
    assert row.player_name is None
    assert row.secondary_player_name is None
    assert row.event_type == EventType.RED_CARD
    assert row.minute == 80
    assert row.extra_minute is None
    assert row.detail == "Red Card"
    assert row.comments is None


def test_transform_match_event_raises_when_required_team_id_is_missing():
    with pytest.raises(KeyError):
        refresh_match_events_service.transform_match_event(
            9001,
            {
                "time": {"elapsed": 10},
                "team": {},
                "type": "Goal",
                "detail": "Normal Goal",
            },
        )


def test_transform_match_event_raises_when_required_elapsed_minute_is_missing():
    with pytest.raises(KeyError):
        refresh_match_events_service.transform_match_event(
            9001,
            {
                "time": {},
                "team": {"id": 1},
                "type": "Goal",
                "detail": "Normal Goal",
            },
        )


def test_fetch_match_events_for_match_calls_api_and_transforms_rows(mocker):
    match = make_match(external_api_id=9001)
    raw_event = make_raw_event(raw_type="Goal", detail="Own Goal", elapsed=12)

    football_get = mocker.patch.object(
        refresh_match_events_service,
        "football_get",
        return_value={"response": [raw_event]},
    )

    rows = refresh_match_events_service.fetch_match_events_for_match(match)

    football_get.assert_called_once_with(
        refresh_match_events_service.API_FOOTBALL_EVENTS_ENDPOINT,
        {"fixture": 9001},
    )
    assert len(rows) == 1
    assert rows[0].external_match_id == 9001
    assert rows[0].event_type == EventType.OWN_GOAL
    assert rows[0].minute == 12


@pytest.mark.parametrize("api_payload", [{"response": []}, {"response": None}, {}])
def test_fetch_match_events_for_match_returns_empty_list_when_api_has_no_events(
    mocker, api_payload
):
    match = make_match(external_api_id=9001)
    mocker.patch.object(refresh_match_events_service, "football_get", return_value=api_payload)

    assert refresh_match_events_service.fetch_match_events_for_match(match) == []


def test_refresh_match_events_completes_successfully_when_there_are_no_live_matches(mocker, db):
    create_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo,
        "create_job",
        return_value=123,
    )
    complete_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "complete_job"
    )
    get_live_matches = mocker.patch.object(
        refresh_match_events_service.matches_service,
        "get_live_matches",
        return_value=[],
    )
    fetch_events = mocker.patch.object(refresh_match_events_service, "fetch_match_events_for_match")
    update_events = mocker.patch.object(
        refresh_match_events_service.match_events_service,
        "update_match_events",
    )

    result = refresh_match_events_service.refresh_match_events(db)

    create_job.assert_called_once_with(db, JobName.MATCH_EVENTS_REFRESH)
    get_live_matches.assert_called_once_with(db)
    fetch_events.assert_not_called()
    update_events.assert_not_called()
    complete_job.assert_called_once_with(db, 123, success=True)
    assert result["tournaments_checked"] == 0
    assert result["message"] == "Match Events refresh completed"


def test_refresh_match_events_skips_match_when_api_returns_no_rows(mocker, db):
    match = make_match(match_id=5, external_api_id=9005, tournament_id=22)
    mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "create_job", return_value=123
    )
    complete_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "complete_job"
    )
    mocker.patch.object(
        refresh_match_events_service.matches_service,
        "get_live_matches",
        return_value=[match],
    )
    fetch_events = mocker.patch.object(
        refresh_match_events_service,
        "fetch_match_events_for_match",
        return_value=[],
    )
    update_events = mocker.patch.object(
        refresh_match_events_service.match_events_service,
        "update_match_events",
    )

    result = refresh_match_events_service.refresh_match_events(db)

    fetch_events.assert_called_once_with(match)
    update_events.assert_not_called()
    complete_job.assert_called_once_with(db, 123, success=True)
    assert result["tournaments_checked"] == 1
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 0
    assert result["message"] == "Match Events refresh completed"


def test_refresh_match_events_continues_after_skipped_match(mocker, db):
    skipped_match = make_match(match_id=5, external_api_id=9005, tournament_id=22)
    updated_match = make_match(match_id=6, external_api_id=9006, tournament_id=22)
    rows = [SimpleNamespace(name="row-1")]

    mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo,
        "create_job",
        return_value=123,
    )
    complete_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo,
        "complete_job",
    )
    mocker.patch.object(
        refresh_match_events_service.matches_service,
        "get_live_matches",
        return_value=[skipped_match, updated_match],
    )
    fetch_events = mocker.patch.object(
        refresh_match_events_service,
        "fetch_match_events_for_match",
        side_effect=[[], rows],
    )
    update_events = mocker.patch.object(
        refresh_match_events_service.match_events_service,
        "update_match_events",
    )

    result = refresh_match_events_service.refresh_match_events(db)

    assert fetch_events.call_args_list == [
        mocker.call(skipped_match),
        mocker.call(updated_match),
    ]
    update_events.assert_called_once_with(db, 6, rows)
    complete_job.assert_called_once_with(db, 123, success=True)

    assert result["message"] == "Match Events refresh completed"
    assert result["tournaments_checked"] == 2
    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 1
    assert result["failures"] == []


def test_refresh_match_events_updates_events_and_counts_rows(mocker, db):
    match = make_match(match_id=5, external_api_id=9005, tournament_id=22)
    rows = [SimpleNamespace(name="row-1"), SimpleNamespace(name="row-2")]

    mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "create_job", return_value=123
    )
    complete_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "complete_job"
    )
    mocker.patch.object(
        refresh_match_events_service.matches_service,
        "get_live_matches",
        return_value=[match],
    )
    fetch_events = mocker.patch.object(
        refresh_match_events_service,
        "fetch_match_events_for_match",
        return_value=rows,
    )
    update_events = mocker.patch.object(
        refresh_match_events_service.match_events_service,
        "update_match_events",
    )

    result = refresh_match_events_service.refresh_match_events(db)

    fetch_events.assert_called_once_with(match)
    update_events.assert_called_once_with(db, 5, rows)
    complete_job.assert_called_once_with(db, 123, success=True)
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["rows_processed"] == 2
    assert result["failures"] == []


def test_refresh_match_events_records_individual_match_failure_and_continues(mocker, db):
    failing_match = make_match(match_id=5, external_api_id=9005, tournament_id=22)
    succeeding_match = make_match(match_id=6, external_api_id=9006, tournament_id=22)
    rows = [SimpleNamespace(name="row-1")]

    mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "create_job", return_value=123
    )
    complete_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "complete_job"
    )
    mocker.patch.object(
        refresh_match_events_service.matches_service,
        "get_live_matches",
        return_value=[failing_match, succeeding_match],
    )
    fetch_events = mocker.patch.object(
        refresh_match_events_service,
        "fetch_match_events_for_match",
        side_effect=[RuntimeError("api exploded"), rows],
    )
    update_events = mocker.patch.object(
        refresh_match_events_service.match_events_service,
        "update_match_events",
    )

    result = refresh_match_events_service.refresh_match_events(db)

    assert fetch_events.call_args_list == [
        mocker.call(failing_match),
        mocker.call(succeeding_match),
    ]
    update_events.assert_called_once_with(db, 6, rows)
    complete_job.assert_called_once_with(db, 123, success=False)
    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 1
    assert result["failures"] == [
        {
            "tournament_id": 22,
            "external_api_id": 9005,
            "season": None,
            "reason": "api exploded",
        }
    ]
    assert result["message"] == "Match Events refresh completed with failures"


def test_refresh_match_events_marks_job_failed_and_reraises_when_live_match_lookup_fails(
    mocker, db
):
    mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "create_job", return_value=123
    )
    complete_job = mocker.patch.object(
        refresh_match_events_service.refresh_jobs_repo, "complete_job"
    )
    mocker.patch.object(
        refresh_match_events_service.matches_service,
        "get_live_matches",
        side_effect=RuntimeError("database unavailable"),
    )
    fetch_events = mocker.patch.object(refresh_match_events_service, "fetch_match_events_for_match")
    update_events = mocker.patch.object(
        refresh_match_events_service.match_events_service,
        "update_match_events",
    )

    with pytest.raises(RuntimeError, match="database unavailable"):
        refresh_match_events_service.refresh_match_events(db)

    fetch_events.assert_not_called()
    update_events.assert_not_called()
    complete_job.assert_called_once_with(db, 123, success=False)
