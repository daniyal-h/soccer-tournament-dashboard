import enum
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class JobStatus(str, enum.Enum):
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class RefreshJob(Base):
    __tablename__ = "refresh_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    job_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    status: Mapped[JobStatus] = mapped_column(
        SQLAlchemyEnum(JobStatus, name="job_status_enum"),
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # null while the job is still running
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    Index("ix_refresh_jobs_status", "status")
