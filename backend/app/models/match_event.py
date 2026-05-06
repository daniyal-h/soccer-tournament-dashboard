import enum

from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class EventType(str, enum.Enum):
    GOAL = "goal"
    OWN_GOAL = "own_goal"
    PENALTY_GOAL = "penalty_goal"
    PENALTY_MISS = "penalty_miss"
    ASSIST = "assist"
    YELLOW_CARD = "yellow_card"
    RED_CARD = "red_card"
    SUBSTITUTION = "substitution"


class MatchEvent(TimestampMixin, Base):
    __tablename__ = "match_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)

    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)

    # only populated for substitutions (player coming on) and goal-linked assists
    secondary_player_id: Mapped[int | None] = mapped_column(ForeignKey("players.id"), nullable=True)

    event_type: Mapped[EventType] = mapped_column(
        SQLAlchemyEnum(EventType, name="event_type_enum"),
        nullable=False,
    )

    minute: Mapped[int] = mapped_column(Integer, nullable=False)

    __table_args__ = (
        Index("ix_match_events_match_id", "match_id"),
        Index("ix_match_events_player_id", "player_id"),
        Index("ix_match_events_team_id", "team_id"),
    )