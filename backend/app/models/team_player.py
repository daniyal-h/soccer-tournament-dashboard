import enum

from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class PositionType(str, enum.Enum):
    GK = "GK"
    DEF = "DEF"
    MID = "MID"
    FWD = "FWD"


class TeamPlayer(Base):
    __tablename__ = "team_players"

    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), primary_key=True)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), primary_key=True)

    # registration attributes, not permanent properties of the player
    squad_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    position: Mapped[PositionType | None] = mapped_column(
        SQLAlchemyEnum(
            PositionType,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="position_type_enum",
        ),
        nullable=True,
    )
