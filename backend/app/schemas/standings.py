from pydantic import BaseModel

from app.schemas.common import TeamStandingsSummary, TeamSummary


class StandingResponse(TeamStandingsSummary):
    team: TeamSummary


class StandingRefreshRow(BaseModel):
    external_team_id: int
    group: str
    position: int
    points: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int
