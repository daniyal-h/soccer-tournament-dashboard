import enum
from datetime import datetime

from sqlalchemy import DateTime, Index, Integer
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class JobName(str, enum.Enum):
    STANDINGS_REFRESH = "standings_refresh"
    MATCHES_REFRESH = "matches_refresh"
    MATCH_EVENTS_REFRESH = "match_events_refresh"
    TEAM_RANKINGS_REFRESH = "team_rankings_refresh"
    PLAYER_STATS_REFRESH = "player_stats_refresh"


class JobStatus(str, enum.Enum):
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


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
