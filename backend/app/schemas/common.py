from pydantic import BaseModel, ConfigDict, computed_field


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
