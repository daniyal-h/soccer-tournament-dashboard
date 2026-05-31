from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class RefreshableTournament:
    id: int
    external_api_id: int
    season: str
    start_date: date
    end_date: date
