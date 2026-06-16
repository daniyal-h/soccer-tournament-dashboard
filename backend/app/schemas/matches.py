from datetime import datetime

from pydantic import BaseModel

from app.models.enums import StageType, StatusType
from app.schemas.common import MatchSummary


class MatchResponse(MatchSummary):
    pass


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
