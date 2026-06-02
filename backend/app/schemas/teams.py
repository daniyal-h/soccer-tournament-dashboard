from pydantic import BaseModel, ConfigDict


class TeamSummary(BaseModel):
    id: int
    name: str
    short_name: str
    logo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
