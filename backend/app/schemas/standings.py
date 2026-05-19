from pydantic import BaseModel, ConfigDict, computed_field


class StandingResponse(BaseModel):
    team_id: int
    group: str
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
