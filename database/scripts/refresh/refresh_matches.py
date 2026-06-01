import re
import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.matches import (
    CANCELLED_STATUS_SHORT_CODES,
    FINISHED_STATUS_SHORT_CODES,
    LIVE_STATUS_SHORT_CODES,
    MATCHES_MARGIN_DAYS,
    POSTPONED_STATUS_SHORT_CODES,
    SCHEDULED_STATUS_SHORT_CODES,
)
from database.scripts.refresh.refresh_helper import get_refreshable_tournaments
from database.utils.backend_api_client import backend_put
from database.utils.football_api_client import football_get


# Football API fixture status converted to what backend expects
def map_fixture_status(status: dict) -> str:
    status_short = (status.get("short") or "").strip().upper()

    if status_short in SCHEDULED_STATUS_SHORT_CODES:
        return "scheduled"

    if status_short in LIVE_STATUS_SHORT_CODES:
        return "live"

    if status_short in FINISHED_STATUS_SHORT_CODES:
        return "finished"

    if status_short in POSTPONED_STATUS_SHORT_CODES:
        return "postponed"

    if status_short in CANCELLED_STATUS_SHORT_CODES:
        return "cancelled"

    return "scheduled"  # safe defaulting


# Football API round names converted to what backend expects
def map_fixture_stage(round_name: str | None) -> str:
    normalized = (round_name or "").strip().lower()

    if "group" in normalized:
        return "group"

    if "round of 32" in normalized:
        return "round_of_32"

    if "round of 16" in normalized:
        return "round_of_16"

    if "quarter" in normalized:
        return "quarter_final"

    if "semi" in normalized:
        return "semi_final"

    if "third" in normalized or "3rd" in normalized:
        return "third_place"

    if normalized == "final" or normalized.endswith(" final"):
        return "final"

    return "other"


def extract_group(round_name: str | None) -> str | None:
    match = re.search(r"group\s+([a-z])", round_name or "", flags=re.IGNORECASE)

    if not match:
        return None

    return match.group(1).upper()


# extract matches data in desired form
def transform_fixture(fixture_row: dict) -> dict:
    fixture = fixture_row["fixture"]
    league = fixture_row["league"]
    teams = fixture_row["teams"]
    goals = fixture_row["goals"]

    return {
        "external_api_id": fixture["id"],
        "external_team_a_id": teams["home"]["id"],
        "external_team_b_id": teams["away"]["id"],
        "kickoff_time": datetime.fromisoformat(fixture["date"]).isoformat(),
        "stage": map_fixture_stage(league.get("round")),
        "status": map_fixture_status(fixture.get("status", {})),
        "venue": fixture.get("venue", {}).get("name"),
        "city": fixture.get("venue", {}).get("city"),
        "elapsed": fixture.get("status", {}).get("elapsed"),
        "team_a_score": goals.get("home"),
        "team_b_score": goals.get("away"),
    }


def refresh_matches() -> None:
    """
    Get all fixtures/matches from all refreshable tournaments.
    Transform the data into internal values expected by the backend.
    Refresh data in the backend through an API PUT request.
    """
    tournaments = get_refreshable_tournaments(margin_days=MATCHES_MARGIN_DAYS)

    for tournament in tournaments:
        # get all matches from API
        data = football_get(
            "/fixtures",
            {
                "league": tournament.external_api_id,
                "season": tournament.season,
            },
        )

        responses = data.get("response", [])

        if not responses:
            continue

        matches_data = [transform_fixture(row) for row in responses]

        backend_put(
            f"/api/v1/admin/tournaments/{tournament.id}/matches",
            matches_data,
        )

        time.sleep(0.5)


if __name__ == "__main__":
    refresh_matches()
