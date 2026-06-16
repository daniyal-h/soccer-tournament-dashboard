from pydantic import BaseModel, ConfigDict

from app.schemas.common import MatchSummary, TeamStandingsSummary, TeamSummary


class TeamProfileResponse(BaseModel):
    team: TeamSummary
    group: str | None = None
    standing: TeamStandingsSummary | None = None

    model_config = ConfigDict(from_attributes=True)


class TeamMatchesResponse(BaseModel):
    data: list[MatchSummary]
