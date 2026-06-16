from datetime import datetime

from pydantic import BaseModel, ConfigDict, computed_field

from app.models.enums import StageType, StatusType


class TeamSummary(BaseModel):
    id: int
    name: str
    short_name: str
    logo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class StandingsStats(BaseModel):
    position: int
    points: int
    wins: int
    draws: int
    losses: int
    goals_for: int
    goals_against: int

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def goal_difference(self) -> int:
        return self.goals_for - self.goals_against

    @computed_field
    @property
    def matches_played(self) -> int:
        return self.wins + self.draws + self.losses


class TeamStandingsSummary(StandingsStats):
    group: str


class MatchSummary(BaseModel):
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
