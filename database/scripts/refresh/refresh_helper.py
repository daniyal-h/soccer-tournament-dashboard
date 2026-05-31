import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from datetime import date

from refresh_types import RefreshableTournament

from database.utils.backend_api_client import backend_get


def get_refreshable_tournaments(margin_days: int = 1) -> list[RefreshableTournament]:
    response = backend_get(
        "/api/v1/admin/tournaments/refreshable",
        params={"margin_days": margin_days},
    )

    return [
        RefreshableTournament(
            id=item["id"],
            external_api_id=item["external_api_id"],
            season=item["season"],
            start_date=date.fromisoformat(item["start_date"]),
            end_date=date.fromisoformat(item["end_date"]),
        )
        for item in response
    ]
