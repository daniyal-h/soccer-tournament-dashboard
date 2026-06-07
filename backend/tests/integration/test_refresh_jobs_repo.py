from datetime import UTC, datetime

from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.constants.jobs import JobName
from app.models.refresh_job import JobStatus, RefreshJob


def test_create_job_inserts_running_row(db_session):
    job_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)

    job = db_session.query(RefreshJob).where(RefreshJob.id == job_id).first()
    assert job is not None
    assert job.status == JobStatus.RUNNING
    assert job.finished_at is None


def test_create_job_returns_id(db_session):
    job_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    assert isinstance(job_id, int)
    assert job_id > 0


def test_complete_job_sets_success_status(db_session):
    job_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, job_id, success=True)

    job = db_session.query(RefreshJob).where(RefreshJob.id == job_id).first()
    assert job.status == JobStatus.SUCCESS
    assert job.finished_at is not None


def test_complete_job_sets_failed_status(db_session):
    job_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, job_id, success=False)

    job = db_session.query(RefreshJob).where(RefreshJob.id == job_id).first()
    assert job.status == JobStatus.FAILED
    assert job.finished_at is not None


def test_complete_job_sets_finished_at(db_session):
    before = datetime.now(UTC)
    job_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, job_id, success=True)

    job = db_session.query(RefreshJob).where(RefreshJob.id == job_id).first()
    assert job.finished_at >= before


def test_get_latest_job_returns_none_when_no_jobs_exist(db_session):
    result = refresh_jobs_repo.get_latest_job(db_session, JobName.STANDINGS_REFRESH)

    assert result is None


def test_get_latest_job_returns_most_recent_job_for_name(db_session):
    older_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    newer_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)

    refresh_jobs_repo.create_job(db_session, JobName.MATCHES_REFRESH)

    result = refresh_jobs_repo.get_latest_job(db_session, JobName.STANDINGS_REFRESH)

    assert result is not None
    assert result.id == newer_id
    assert result.id != older_id
    assert result.job_name == JobName.STANDINGS_REFRESH


def test_get_latest_successful_job_returns_none_when_no_jobs_exist(db_session):
    result = refresh_jobs_repo.get_latest_successful_job(
        db_session,
        JobName.STANDINGS_REFRESH,
    )

    assert result is None


def test_get_latest_successful_job_ignores_running_and_failed_jobs(db_session):
    running_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)

    failed_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, failed_id, success=False)

    result = refresh_jobs_repo.get_latest_successful_job(
        db_session,
        JobName.STANDINGS_REFRESH,
    )

    assert result is None

    running_job = db_session.query(RefreshJob).where(RefreshJob.id == running_id).first()
    assert running_job.status == JobStatus.RUNNING


def test_get_latest_successful_job_returns_latest_success_for_name(db_session):
    older_success_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, older_success_id, success=True)

    failed_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, failed_id, success=False)

    newer_success_id = refresh_jobs_repo.create_job(db_session, JobName.STANDINGS_REFRESH)
    refresh_jobs_repo.complete_job(db_session, newer_success_id, success=True)

    refresh_jobs_repo.create_job(db_session, JobName.MATCHES_REFRESH)

    result = refresh_jobs_repo.get_latest_successful_job(
        db_session,
        JobName.STANDINGS_REFRESH,
    )

    assert result is not None
    assert result.id == newer_success_id
    assert result.id != older_success_id
    assert result.id != failed_id
    assert result.status == JobStatus.SUCCESS
    assert result.finished_at is not None
    assert result.job_name == JobName.STANDINGS_REFRESH
