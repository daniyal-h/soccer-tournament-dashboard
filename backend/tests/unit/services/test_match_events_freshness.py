from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.api.v1.services.freshness import match_events as match_events_freshness
from app.models.enums import StatusType
from app.models.refresh_job import JobName, JobStatus

NOW = datetime(2026, 6, 7, 12, 0, tzinfo=UTC)


@pytest.fixture
def db():
    return Mock()


def make_match(status=StatusType.LIVE):
    return SimpleNamespace(status=status)


def make_job(status=JobStatus.SUCCESS, finished_at=None):
    return SimpleNamespace(status=status, finished_at=finished_at)


def assert_metadata(
    metadata,
    *,
    is_delayed,
    last_updated=None,
    last_successful_refresh=None,
    message=None,
):
    assert metadata.is_delayed is is_delayed
    assert metadata.last_updated == last_updated
    assert metadata.last_successful_refresh == last_successful_refresh
    assert metadata.message == message


@pytest.mark.parametrize(
    "status",
    [
        StatusType.SCHEDULED,
        StatusType.FINISHED,
        StatusType.POSTPONED,
        StatusType.CANCELLED,
    ],
)
def test_get_match_events_delay_metadata_returns_static_metadata_for_non_live_matches(
    mocker,
    db,
    status,
):
    get_latest_job = mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
    )
    get_latest_successful_job = mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(status=status),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=False,
        last_updated=None,
        last_successful_refresh=None,
        message=None,
    )
    get_latest_job.assert_not_called()
    get_latest_successful_job.assert_not_called()


def test_get_match_events_delay_metadata_marks_live_match_delayed_when_no_refresh_has_run(
    mocker,
    db,
):
    get_latest_job = mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=None,
    )
    get_latest_successful_job = mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=None,
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=True,
        last_updated=None,
        last_successful_refresh=None,
        message="Live match events may be delayed because no refresh has run yet.",
    )
    get_latest_job.assert_called_once_with(db, JobName.MATCH_EVENTS_REFRESH)
    get_latest_successful_job.assert_called_once_with(db, JobName.MATCH_EVENTS_REFRESH)


def test_get_match_events_delay_metadata_marks_live_match_delayed_when_latest_job_failed(
    mocker,
    db,
):
    successful_finished_at = NOW - timedelta(minutes=12)

    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.FAILED, finished_at=NOW - timedelta(minutes=1)),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=successful_finished_at),
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=True,
        last_updated=None,
        last_successful_refresh=successful_finished_at,
        message="Live match events may be delayed because the latest refresh failed.",
    )


def test_get_match_events_delay_metadata_handles_failed_latest_job_without_previous_success(
    mocker,
    db,
):
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.FAILED, finished_at=NOW - timedelta(minutes=1)),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=None,
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=True,
        last_updated=None,
        last_successful_refresh=None,
        message="Live match events may be delayed because the latest refresh failed.",
    )


def test_get_match_events_delay_metadata_marks_live_match_delayed_when_latest_job_is_running(
    mocker,
    db,
):
    successful_finished_at = NOW - timedelta(minutes=4)

    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.RUNNING, finished_at=None),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=successful_finished_at),
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=True,
        last_updated=None,
        last_successful_refresh=successful_finished_at,
        message="Live match events may be delayed because the latest refresh is still running.",
    )


def test_get_match_events_delay_metadata_handles_running_latest_job_without_previous_success(
    mocker,
    db,
):
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.RUNNING, finished_at=None),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=None,
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=True,
        last_updated=None,
        last_successful_refresh=None,
        message="Live match events may be delayed because the latest refresh is still running.",
    )


def test_get_match_events_delay_metadata_marks_live_match_delayed_when_latest_job_is_stale(
    mocker,
    db,
):
    latest_finished_at = NOW - timedelta(minutes=10, seconds=1)
    successful_finished_at = NOW - timedelta(minutes=11)

    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=latest_finished_at),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=successful_finished_at),
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=True,
        last_updated=None,
        last_successful_refresh=successful_finished_at,
        message="Live match events may be delayed because they have not refreshed recently.",
    )


def test_get_match_events_delay_metadata_does_not_mark_exact_ten_minute_old_job_as_stale(
    mocker,
    db,
):
    latest_finished_at = NOW - timedelta(minutes=10)

    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=latest_finished_at),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=None,
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=False,
        last_updated=latest_finished_at,
        last_successful_refresh=latest_finished_at,
        message=None,
    )


def test_get_match_events_delay_metadata_returns_fresh_metadata_with_latest_success(
    mocker,
    db,
):
    latest_finished_at = NOW - timedelta(minutes=3)
    successful_finished_at = NOW - timedelta(minutes=5)

    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=latest_finished_at),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=successful_finished_at),
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=False,
        last_updated=latest_finished_at,
        last_successful_refresh=successful_finished_at,
        message=None,
    )


def test_get_match_events_delay_metadata_uses_latest_job_as_success_fallback_when_no_success_job(
    mocker,
    db,
):
    latest_finished_at = NOW - timedelta(minutes=2)

    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_job",
        return_value=make_job(status=JobStatus.SUCCESS, finished_at=latest_finished_at),
    )
    mocker.patch.object(
        match_events_freshness.refresh_jobs_repo,
        "get_latest_successful_job",
        return_value=None,
    )

    metadata = match_events_freshness.get_match_events_delay_metadata(
        db,
        make_match(),
        now=NOW,
    )

    assert_metadata(
        metadata,
        is_delayed=False,
        last_updated=latest_finished_at,
        last_successful_refresh=latest_finished_at,
        message=None,
    )
