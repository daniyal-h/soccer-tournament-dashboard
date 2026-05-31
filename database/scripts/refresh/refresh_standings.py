import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from refresh_helper import get_refreshable_tournaments

from database.constants.tournaments import STANDINGS_MARGIN_DAYS
from database.utils.backend_api_client import backend_put
from database.utils.football_api_client import football_get


def refresh_standings() -> None:
    tournaments = get_refreshable_tournaments(margin_days=STANDINGS_MARGIN_DAYS)

    for tournament in tournaments:
        data = football_get(
            "/standings",
            {"league": tournament.external_api_id, "season": tournament.season},
        )

        responses = data.get("response", [])

        if not responses:
            continue

        # transform response into standings shape
        standings_data = []
        standings_groups = responses[0]["league"].get("standings", [])

        for group_rows in standings_groups:
            for row in group_rows:
                raw_group = row.get("group") or ""
                group = raw_group.replace("Group ", "").strip()

                # skip extraneous non-group data
                if len(group) != 1 or not group.isalpha():
                    continue

                standings_data.append(
                    {
                        "external_team_id": row["team"]["id"],
                        "group": group.upper(),
                        "position": row.get("rank", 0),
                        "points": row.get("points", 0),
                        "wins": row["all"].get("win", 0),
                        "draws": row["all"].get("draw", 0),
                        "losses": row["all"].get("lose", 0),
                        "goals_for": row["all"]["goals"].get("for", 0),
                        "goals_against": row["all"]["goals"].get("against", 0),
                    }
                )

        backend_put(
            f"/api/v1/admin/tournaments/{tournament.id}/standings", standings_data
        )

        time.sleep(0.5)  # API-Football rate limits


if __name__ == "__main__":
    refresh_standings()
