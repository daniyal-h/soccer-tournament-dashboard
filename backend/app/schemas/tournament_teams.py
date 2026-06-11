from pydantic import BaseModel, ConfigDict

from app.models.match import StageType
from app.schemas.teams import TeamSummary


class TournamentTeamResponse(BaseModel):
    team: TeamSummary
    group: str | None = None
    final_rank: int | None = None
    stage_reached: StageType | None = None

    model_config = ConfigDict(from_attributes=True)
