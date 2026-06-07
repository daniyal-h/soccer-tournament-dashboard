from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ResponseMetadata(BaseModel):
    is_delayed: bool
    last_updated: datetime | None = None
    last_successful_refresh: datetime | None = None
    message: str | None = None

    model_config = ConfigDict(from_attributes=True)
