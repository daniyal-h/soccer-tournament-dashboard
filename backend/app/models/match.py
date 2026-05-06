import enum
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class StageType(str, enum.Enum):
    GROUP = "group"
    KNOCKOUT = "knockout"
    OTHER = "other"


class StatusType(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    FINISHED = "finished"
    POSTPONED = "postponed"
    CANCELLED = "cancelled"


class Match(TimestampMixin, Base):
    __tablename__ = "matches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # API-Football identifier used for syncing
    external_api_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)

    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), nullable=False)

    team_a_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    team_b_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)

    kickoff_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    stage: Mapped[StageType] = mapped_column(
        SQLAlchemyEnum(StageType, name="stage_type_enum"),
        nullable=False,
    )

    # knockout matches don't belong in groups
    group: Mapped[str | None] = mapped_column(String(10), nullable=True)

    status: Mapped[StatusType] = mapped_column(
        SQLAlchemyEnum(StatusType, name="status_type_enum"),
        nullable=False,
    )

    venue: Mapped[str | None] = mapped_column(String(100), nullable=True)

    team_a_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    team_b_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    __table_args__ = (
        Index("ix_matches_tournament_id", "tournament_id"),
        Index("ix_matches_team_a_id", "team_a_id"),
        Index("ix_matches_team_b_id", "team_b_id"),
        Index("ix_matches_kickoff_time", "kickoff_time"),
        Index("ix_matches_status", "status"),
    )
