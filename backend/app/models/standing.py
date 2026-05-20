from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin
from .team import Team


class Standing(TimestampMixin, Base):
    __tablename__ = "standings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)

    group: Mapped[str] = mapped_column(String(10), nullable=False)

    # Denormalized rank: must be updated atomically with the rest of the row
    position: Mapped[int] = mapped_column(Integer, nullable=False)

    points: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    wins: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    draws: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    losses: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    goals_for: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    goals_against: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    team: Mapped[Team] = relationship("Team", lazy="joined")

    __table_args__ = (
        Index("ix_standings_tournament_id", "tournament_id"),
        Index("ix_standings_team_id", "team_id"),
        Index("ix_standings_tournament_group", "tournament_id", "group"),
        Index(
            "uq_standings_tournament_team",
            "tournament_id",
            "team_id",
            unique=True,
        ),
    )
