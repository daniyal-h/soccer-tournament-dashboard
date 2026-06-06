from pydantic import BaseModel, ConfigDict


class PlayerSummary(BaseModel):
    id: int
    first_name: str
    last_name: str
    photo_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
