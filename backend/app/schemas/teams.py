from pydantic import BaseModel, ConfigDict

from app.schemas.common import TeamStandingsSummary, TeamSummary


class TeamProfileResponse(BaseModel):
    team: TeamSummary
    standing: TeamStandingsSummary | None = None

    model_config = ConfigDict(from_attributes=True)
