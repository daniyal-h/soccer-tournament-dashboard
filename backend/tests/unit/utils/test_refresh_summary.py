from app.utils.refresh_summary import RefreshFailure, RefreshSummary


def test_refresh_summary_defaults_to_zero_counts_and_no_failures():
    summary = RefreshSummary(resource_name="Matches")

    result = summary.to_dict()

    assert result["message"] == "Matches refresh completed"
    assert result["resource_name"] == "Matches"
    assert result["tournaments_checked"] == 0
    assert result["tournaments_refreshed"] == 0
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 0
    assert result["failures"] == []


def test_mark_refreshed_increments_tournament_and_row_counts():
    summary = RefreshSummary(resource_name="Standings", tournaments_checked=2)

    summary.mark_refreshed(rows_count=4)
    summary.mark_refreshed(rows_count=3)

    result = summary.to_dict()

    assert result["tournaments_checked"] == 2
    assert result["tournaments_refreshed"] == 2
    assert result["rows_processed"] == 7
    assert result["tournaments_skipped"] == 0
    assert result["failures"] == []


def test_mark_skipped_increments_skipped_count():
    summary = RefreshSummary(resource_name="Standings", tournaments_checked=3)

    summary.mark_skipped()
    summary.mark_skipped()

    result = summary.to_dict()

    assert result["tournaments_checked"] == 3
    assert result["tournaments_skipped"] == 2
    assert result["tournaments_refreshed"] == 0
    assert result["rows_processed"] == 0


def test_add_failure_stores_failure_details_and_changes_message():
    summary = RefreshSummary(resource_name="Matches", tournaments_checked=1)

    summary.add_failure(
        tournament_id=4,
        external_api_id=9,
        season="2024",
        reason="API failed",
    )

    result = summary.to_dict()

    assert result["message"] == "Matches refresh completed with failures"
    assert result["failures"] == [
        {
            "tournament_id": 4,
            "external_api_id": 9,
            "season": "2024",
            "reason": "API failed",
        }
    ]


def test_refresh_failure_dataclass_stores_expected_fields():
    failure = RefreshFailure(
        tournament_id=1,
        external_api_id=9,
        season="2024",
        reason="database failed",
    )

    assert failure.tournament_id == 1
    assert failure.external_api_id == 9
    assert failure.season == "2024"
    assert failure.reason == "database failed"
