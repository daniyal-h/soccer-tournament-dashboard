from datetime import UTC, datetime, timedelta

from sqlalchemy.orm import Session

from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.models.match import Match, StatusType
from app.models.refresh_job import JobName, JobStatus
from app.schemas.metadata import ResponseMetadata


def get_match_events_delay_metadata(
    db: Session,
    match: Match,
    now: datetime | None = None,
) -> ResponseMetadata:
    current_time = now or datetime.now(UTC)

    # no delay considered for static data
    if match.status != StatusType.LIVE:
        return ResponseMetadata(
            is_delayed=False,
            last_updated=None,
            last_successful_refresh=None,
            message=None,
        )

    # derive metadata from refresh jobs
    latest_job = refresh_jobs_repo.get_latest_job(db, JobName.MATCH_EVENTS_REFRESH)
    latest_success = refresh_jobs_repo.get_latest_successful_job(
        db,
        JobName.MATCH_EVENTS_REFRESH,
    )

    # early returns for all possible delay paths

    if not latest_job:
        return ResponseMetadata(
            is_delayed=True,
            last_updated=None,
            last_successful_refresh=None,
            message="Live match events may be delayed because no refresh has run yet.",
        )

    if latest_job.status == JobStatus.FAILED:
        return ResponseMetadata(
            is_delayed=True,
            last_updated=None,
            last_successful_refresh=latest_success.finished_at if latest_success else None,
            message="Live match events may be delayed because the latest refresh failed.",
        )

    if latest_job.finished_at is None:
        return ResponseMetadata(
            is_delayed=True,
            last_updated=None,
            last_successful_refresh=latest_success.finished_at if latest_success else None,
            message="Live match events may be delayed because the latest refresh is still running.",
        )

    if current_time - latest_job.finished_at > timedelta(minutes=10):
        return ResponseMetadata(
            is_delayed=True,
            last_updated=None,
            last_successful_refresh=latest_success.finished_at if latest_success else None,
            message="Live match events may be delayed because they have not refreshed recently.",
        )

    # updated data
    return ResponseMetadata(
        is_delayed=False,
        last_updated=latest_job.finished_at,
        last_successful_refresh=latest_success.finished_at
        if latest_success
        else latest_job.finished_at,
        message=None,
    )
