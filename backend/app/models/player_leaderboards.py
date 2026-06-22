from decimal import Decimal

from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import ForeignKey, Index, Integer, Numeric, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.enums import LeaderboardType

from .base import Base, TimestampMixin


class PlayerLeaderboard(TimestampMixin, Base):
    __tablename__ = "player_leaderboards"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    tournament_id: Mapped[int] = mapped_column(ForeignKey("tournaments.id"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id"), nullable=False)
    player_id: Mapped[int] = mapped_column(ForeignKey("players.id"), nullable=False)

    category: Mapped[LeaderboardType] = mapped_column(
        SQLAlchemyEnum(
            LeaderboardType,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="leaderboard_type_enum",
        ),
        nullable=False,
    )

    rank: Mapped[int] = mapped_column(Integer, nullable=False)  # placement in top-20
    value: Mapped[int] = mapped_column(Integer, nullable=False)  # value of category (x goals)

    # optional data to enrich frontend player card
    appearances: Mapped[int | None] = mapped_column(Integer, nullable=True)
    minutes_played: Mapped[int | None] = mapped_column(Integer, nullable=True)
    rating: Mapped[Decimal | None] = mapped_column(Numeric(4, 2), nullable=True) 

    __table_args__ = (
        UniqueConstraint(
            "tournament_id",
            "category",
            "player_id",
            name="uq_player_leaderboards_tournament_category_player",
        ),
        Index(
            "ix_player_leaderboards_tournament_category_rank", "tournament_id", "category", "rank"
        ),
        Index("ix_player_leaderboards_tournament_category", "tournament_id", "category"),
        Index("ix_player_leaderboards_player_id", "player_id"),
        Index("ix_player_leaderboards_team_id", "team_id"),
    )
