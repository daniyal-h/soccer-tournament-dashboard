from pydantic import BaseModel, ConfigDict


class TeamsSummary(BaseModel):
    id: int
    name: str
    short_name: str
    logo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
