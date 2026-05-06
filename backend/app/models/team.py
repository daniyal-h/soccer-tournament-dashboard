import enum

from sqlalchemy import Enum as SQLAlchemyEnum
from sqlalchemy import Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class TeamType(str, enum.Enum):
    NATIONAL = "national"
    CLUB = "club"


class Team(TimestampMixin, Base):
    __tablename__ = "teams"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # API-Football identifier used for syncing
    external_api_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)

    name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    short_name: Mapped[str] = mapped_column(String(20), nullable=False)

    # "national" for international teams, "club" for leagues
    type: Mapped[TeamType] = mapped_column(
        SQLAlchemyEnum(
            TeamType,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
            name="team_type_enum",
        ),
        nullable=False,
    )

    logo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    country: Mapped[str] = mapped_column(String(100), nullable=False)

    __table_args__ = (
        # Composite index for the common "find team by name in country" query
        Index("ix_teams_name_country", "name", "country"),
    )
