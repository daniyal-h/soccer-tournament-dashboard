import enum

from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class EventType(str, enum.Enum):
    GOAL = "goal"
    OWN_GOAL = "own_goal"
    PENALTY_GOAL = "penalty_goal"
    PENALTY_MISS = "penalty_miss"
    YELLOW_CARD = "yellow_card"
    RED_CARD = "red_card"
    SUBSTITUTION = "substitution"
    VAR = "var"
    OTHER = "other"


class MatchEvent(TimestampMixin, Base):
    __tablename__ = "match_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    match_id: Mapped[int] = mapped_column(ForeignKey("matches.id"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)

    player_id: Mapped[int | None] = mapped_column(ForeignKey("players.id"), nullable=True)
    secondary_player_id: Mapped[int | None] = mapped_column(ForeignKey("players.id"), nullable=True)

    player_external_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    secondary_player_external_id: Mapped[int | None] = mapped_column(Integer, nullable=True)

    player_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    secondary_player_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    event_type: Mapped[EventType] = mapped_column(
        SQLAlchemyEnum(
            EventType,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="event_type_enum",
        ),
        nullable=False,
    )

    minute: Mapped[int] = mapped_column(Integer, nullable=False)
    extra_minute: Mapped[int | None] = mapped_column(Integer, nullable=True)

    detail: Mapped[str | None] = mapped_column(String(100), nullable=True)
    comments: Mapped[str | None] = mapped_column(String(255), nullable=True)

    team = relationship("Team")
    player = relationship("Player", foreign_keys=[player_id])
    secondary_player = relationship("Player", foreign_keys=[secondary_player_id])

    __table_args__ = (
        Index("ix_match_events_match_id", "match_id"),
        Index("ix_match_events_player_id", "player_id"),
        Index("ix_match_events_team_id", "team_id"),
    )
