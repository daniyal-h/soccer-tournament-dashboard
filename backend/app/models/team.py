import enum
from datetime import datetime

from sqlalchemy import DateTime
from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Index, Integer, String, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class TeamType(str, enum.Enum):
    NATIONAL = "national"
    CLUB = "club"


class Team(Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # API-Football identifier used for syncing
    external_api_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    short_name: Mapped[str] = mapped_column(String(20), nullable=False)

    # "national" for international teams, "club" for leagues
    type: Mapped[TeamType] = mapped_column(
        SQLAlchemyEnum(TeamType, name="team_type_enum"),
        nullable=False,
    )

    logo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    country: Mapped[str] = mapped_column(String(100), nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # updated_at is maintained by the set_updated_at Postgres trigger defined in the Alembic migration
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        # Composite index for the common "find team by name in country" query
        Index("ix_teams_name_country", "name", "country"),
    )
