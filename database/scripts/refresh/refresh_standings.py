import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.api_client import api_get, api_put


def refresh_standings() -> None:
    for local_id, tournament_api_id, season in SUPPORTED_TOURNAMENTS:
        # fetch fresh standings from API-Football
        data = api_get("/standings", {"league": tournament_api_id, "season": season})
        responses = data.get("response", [])

        if not responses:
            continue

        # transform response into standings shape
        standings_data = []
        standings_groups = responses[0]["league"].get("standings", [])

        for group_rows in standings_groups:
            for row in group_rows:
                standings_data.append(
                    {
                        "external_team_id": row["team"]["id"],
                        "group": row.get("group", "").replace("Group ", "").strip(),
                        "position": row.get("rank", 0),
                        "points": row.get("points", 0),
                        "wins": row["all"].get("win", 0),
                        "draws": row["all"].get("draw", 0),
                        "losses": row["all"].get("lose", 0),
                        "goals_for": row["all"]["goals"].get("for", 0),
                        "goals_against": row["all"]["goals"].get("against", 0),
                    }
                )

        # get local tournament id and send to backend
        tournament_id = local_id
        api_put(f"/api/v1/admin/standings/{tournament_id}", standings_data)

        time.sleep(0.5)  # API-Football rate limits


if __name__ == "__main__":
    refresh_standings()
