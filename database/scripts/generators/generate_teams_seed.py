import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.api_client import api_get

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = GENERATED_SEEDS_DIR / "teams.sql"


teams_seen = set()
teams_sql = []

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    params = {
        "league": tournament_api_id,
        "season": season,
    }

    data = api_get("/teams", params)

    for entry in data["response"]:
        team = entry["team"]

        external_team_id = team["id"]

        name = (team.get("name") or "").replace("'", "''")
        short_name = (team.get("code") or "").replace("'", "''")
        country = (team.get("country") or "").replace("'", "''")
        logo_url = (team.get("logo") or "").replace("'", "''")

        if external_team_id not in teams_seen:
            teams_seen.add(external_team_id)

            teams_sql.append(
                f"({external_team_id}, '{name}', '{short_name}', "
                f"'national', '{logo_url}', '{country}')"
            )

    time.sleep(0.5) # API-Football rate limits

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if teams_sql:
        f.write(
            "INSERT INTO teams (\n"
            "    external_api_id,\n"
            "    name,\n"
            "    short_name,\n"
            "    type,\n"
            "    logo_url,\n"
            "    country\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(teams_sql))

        f.write("\nON CONFLICT (external_api_id)\nDO NOTHING;\n\n")

    f.write("COMMIT TRANSACTION;\n")

print("teams.sql generated successfully")
