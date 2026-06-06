from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.match import StageType, StatusType

from .teams import TeamSummary


class MatchResponse(BaseModel):
    id: int
    team_a: TeamSummary
    team_b: TeamSummary
    kickoff_time: datetime
    stage: StageType
    group: str | None = None
    status: StatusType
    venue: str | None = None
    city: str | None = None
    elapsed: int | None = None
    team_a_score: int | None = None
    team_b_score: int | None = None
    team_a_penalties: int | None = None
    team_b_penalties: int | None = None

    model_config = ConfigDict(from_attributes=True)


class MatchRefreshRow(BaseModel):
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
    team_a_penalties: int | None = None
    team_b_penalties: int | None = None
