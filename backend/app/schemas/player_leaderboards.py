from decimal import Decimal

from pydantic import BaseModel, ConfigDict

from app.models.enums import LeaderboardType

from .common import PlayerSimpleSummary, TeamSummary


class RankedPlayer(BaseModel):
    rank: int
    value: int
    player: PlayerSimpleSummary
    team: TeamSummary
    appearances: int | None = None
    minutes_player: int | None = None
    rating: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)


class PlayerLeaderboardResponse(BaseModel):
    category: LeaderboardType
    data: list[RankedPlayer]
