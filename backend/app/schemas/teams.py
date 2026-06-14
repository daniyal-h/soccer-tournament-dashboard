from pydantic import BaseModel, ConfigDict

from .standings import TeamStandingsSummary


class TeamSummary(BaseModel):
    id: int
    name: str
    short_name: str
    logo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class TeamProfileResponse(BaseModel):
    team: TeamSummary
    standing: TeamStandingsSummary | None = None

    model_config = ConfigDict(from_attributes=True)
