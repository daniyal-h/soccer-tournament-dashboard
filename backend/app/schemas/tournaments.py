from datetime import date

from pydantic import BaseModel, ConfigDict


class TournamentResponse(BaseModel):
    id: int
    name: str
    season: str
    logo_url: str
    start_date: date
    end_date: date

    model_config = ConfigDict(from_attributes=True)