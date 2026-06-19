from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.enums import JobName, JobStatus
from app.models.refresh_job import RefreshJob


# create a RUNNING job and return its ID
def create_job(db: Session, name: JobName) -> int:
    job = RefreshJob(
        job_name=name,
        status=JobStatus.RUNNING,
        started_at=datetime.now(UTC),
        finished_at=None,
    )

    db.add(job)
    db.flush()  # write to DB and populate job.id
    db.commit()

    return job.id


# complete a job by setting its status and finish time
def complete_job(db: Session, job_id: int, success: bool) -> None:
    job = db.query(RefreshJob).where(RefreshJob.id == job_id).first()

    job.status = JobStatus.SUCCESS if success else JobStatus.FAILED
    job.finished_at = datetime.now(UTC)

    db.commit()


def get_latest_job(db: Session, job_name: JobName) -> RefreshJob | None:
    return (
        db.query(RefreshJob)
        .where(RefreshJob.job_name == job_name)
        .order_by(RefreshJob.started_at.desc())
        .first()
    )


def get_latest_successful_job(db: Session, job_name: JobName) -> RefreshJob | None:
    return (
        db.query(RefreshJob)
        .where(RefreshJob.job_name == job_name)
        .where(RefreshJob.status == JobStatus.SUCCESS)
        .where(RefreshJob.finished_at.isnot(None))
        .order_by(RefreshJob.started_at.desc())
        .first()
    )
