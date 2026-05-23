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
