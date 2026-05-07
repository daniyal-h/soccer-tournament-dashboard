from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class TournamentTeam(Base):
    __tablename__ = "tournament_teams"

    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), primary_key=True)

    # Assigned at draw, null until the draw is completed
    group: Mapped[str | None] = mapped_column(String(10), nullable=True)
