from datetime import date

from sqlalchemy import Date, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class Player(TimestampMixin, Base):
    __tablename__ = "players"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # API-Football identifier used for syncing
    external_api_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True, index=True)

    display_name: Mapped[str] = mapped_column(String(150), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    date_of_birth: Mapped[date] = mapped_column(Date, nullable=True)

    photo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    nationality: Mapped[str] = mapped_column(String(100), nullable=True)

    height: Mapped[int | None] = mapped_column(Integer, nullable=True)

    __table_args__ = (
        Index("ix_players_last_name_first_name", "last_name", "first_name"),
        Index("ix_players_display_name", "display_name"),
    )
