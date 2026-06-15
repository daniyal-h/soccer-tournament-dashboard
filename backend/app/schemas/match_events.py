from pydantic import BaseModel, ConfigDict

from app.models.match_event import EventType
from app.schemas.common import TeamSummary
from app.schemas.metadata import ResponseMetadata
from app.schemas.players import PlayerSummary


class MatchEventItemResponse(BaseModel):
    team: TeamSummary

    player: PlayerSummary | None = None
    secondary_player: PlayerSummary | None = None

    player_name: str | None = None
    secondary_player_name: str | None = None

    player_external_id: int | None = None
    secondary_player_external_id: int | None = None

    event_type: EventType

    minute: int
    extra_minute: int | None = None

    detail: str | None = None
    comments: str | None = None

    model_config = ConfigDict(from_attributes=True)


class MatchEventsResponse(BaseModel):
    data: list[MatchEventItemResponse]
    metadata: ResponseMetadata


class MatchEventRefreshRow(BaseModel):
    external_match_id: int
    external_team_id: int

    player_external_id: int | None = None
    secondary_player_external_id: int | None = None

    player_name: str | None = None
    secondary_player_name: str | None = None

    event_type: EventType

    minute: int
    extra_minute: int | None = None

    detail: str | None = None
    comments: str | None = None
