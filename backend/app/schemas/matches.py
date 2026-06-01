from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.match import StageType, StatusType

from .teams import TeamsSummary


class MatchesResponse(BaseModel):
    id: int
    team_a: TeamsSummary
    team_b: TeamsSummary
    kickoff_time: datetime
    stage: StageType
    group: str | None = None
    status: StatusType
    venue: str | None = None
    city: str | None = None
    elapsed: int | None = None
    team_a_score: int | None = None
    team_b_score: int | None = None

    model_config = ConfigDict(from_attributes=True)


class MatchesRefreshRow(BaseModel):
    external_api_id: int
    external_team_a_id: int
    external_team_b_id: int
    kickoff_time: datetime
    stage: StageType
    status: StatusType
    venue: str | None = None
    city: str | None = None
    elapsed: int | None = None
    team_a_score: int | None = None
    team_b_score: int | None = None
