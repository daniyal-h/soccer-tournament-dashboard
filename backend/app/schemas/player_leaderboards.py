from pydantic import BaseModel, ConfigDict

from app.models.enums import LeaderboardType

from .common import PlayerSimpleSummary, TeamSummary


class RankedPlayer(BaseModel):
    rank: int
    value: int
    player: PlayerSimpleSummary
    team: TeamSummary
    appearances: int | None = None
    minutes_played: int | None = None
    rating: float | None = None

    model_config = ConfigDict(from_attributes=True)


class PlayerLeaderboardResponse(BaseModel):
    category: LeaderboardType
    data: list[RankedPlayer]


class PlayerLeaderboardRefreshRow(BaseModel):
    external_team_id: int
    external_player_id: int

    category: LeaderboardType
    rank: int
    value: int
    appearances: int | None = None
    minutes_played: int | None = None
    rating: float | None = None
