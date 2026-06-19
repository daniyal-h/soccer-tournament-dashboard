from datetime import date

from pydantic import BaseModel, ConfigDict

from app.models.enums import PositionType
from app.schemas.common import MatchSummary, PlayerSummary, TeamStandingsSummary, TeamSummary


class TeamProfileResponse(BaseModel):
    team: TeamSummary
    group: str | None = None
    standing: TeamStandingsSummary | None = None

    model_config = ConfigDict(from_attributes=True)


class TeamMatchesResponse(BaseModel):
    data: list[MatchSummary]


class TeamSquadPlayer(BaseModel):
    player: PlayerSummary
    squad_number: int | None = None
    position: PositionType | None = None

    model_config = ConfigDict(from_attributes=True)


class TeamSquadResponse(BaseModel):
    data: list[TeamSquadPlayer]


class TeamPlayerRefreshRow(BaseModel):
    external_player_id: int
    external_team_id: int

    display_name: str
    first_name: str | None = None
    last_name: str | None = None
    date_of_birth: date | None = None
    photo_url: str | None = None
    nationality: str | None = None
    height: int | None = None

    squad_number: int | None = None
    position: PositionType | None = None
