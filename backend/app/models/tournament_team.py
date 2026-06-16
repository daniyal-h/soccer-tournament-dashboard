from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.enums import StageType
from app.models.team import Team

from .base import Base


class TournamentTeam(Base):
    __tablename__ = "tournament_teams"

    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), primary_key=True)

    group: Mapped[str | None] = mapped_column(String(10), nullable=True)

    final_rank: Mapped[int | None] = mapped_column(Integer, nullable=True)
    stage_reached: Mapped[StageType | None] = mapped_column(
        SQLAlchemyEnum(
            StageType,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="stage_type_enum",
        ),
        nullable=True,
    )

    team: Mapped[Team] = relationship("Team", lazy="joined")

    __table_args__ = (
        Index("ix_tournament_teams_tournament_final_rank", "tournament_id", "final_rank"),
    )
