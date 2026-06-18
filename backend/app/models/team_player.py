from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.players import Player

from app.models.enums import PositionType

from .base import Base


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

    player: Mapped[Player] = relationship("Player", lazy="joined")
