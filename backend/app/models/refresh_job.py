from datetime import datetime

from sqlalchemy import DateTime, Index, Integer
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column

from app.models.enums import JobName, JobStatus

from .base import Base


class RefreshJob(Base):
    __tablename__ = "refresh_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    job_name: Mapped[JobName] = mapped_column(
        SQLAlchemyEnum(
            JobName,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="job_name_enum",
        ),
        nullable=False,
        index=True,
    )

    status: Mapped[JobStatus] = mapped_column(
        SQLAlchemyEnum(
            JobStatus,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="job_status_enum",
        ),
        nullable=False,
    )

    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    # null while the job is still running
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    __table_args__ = (Index("ix_refresh_jobs_status", "status"),)
