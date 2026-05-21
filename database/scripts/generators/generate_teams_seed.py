import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"

OUTPUT_FILE = GENERATED_SEEDS_DIR / "teams.sql"

load_dotenv(SCRIPTS_DIR.parent / ".env")

API_KEY = os.getenv("API_FOOTBALL_API_KEY")

if not API_KEY:
    raise ValueError("Missing API_FOOTBALL_API_KEY environment variable")

HEADERS = {
    "x-apisports-key": API_KEY,
}

BASE_URL = "https://v3.football.api-sports.io"

TOURNAMENTS = [
    (1, "2022"),  # FIFA World Cup 2022
    # (1, "2026"),  # FIFA World Cup 2026
    # (4, "2024"),  # UEFA Euro 2024
]

teams_seen = set()

teams_sql = []
tournament_teams_sql = []

for tournament_api_id, season in TOURNAMENTS:
    response = requests.get(
        f"{BASE_URL}/teams",
        headers=HEADERS,
        params={
            "league": tournament_api_id,
            "season": season,
        },
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()

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

        tournament_teams_sql.append(
            f"""(
(
    SELECT id
    FROM tournaments
    WHERE external_api_id = {tournament_api_id}
      AND season = '{season}'
),
(
    SELECT id
    FROM teams
    WHERE external_api_id = {external_team_id}
),
NULL
)"""
        )

    time.sleep(0.5)

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

        f.write(
            "\nON CONFLICT (external_api_id)\n"
            "DO UPDATE SET\n"
            "    name = EXCLUDED.name,\n"
            "    short_name = EXCLUDED.short_name,\n"
            "    type = EXCLUDED.type,\n"
            "    logo_url = EXCLUDED.logo_url,\n"
            "    country = EXCLUDED.country;\n\n"
        )

    if tournament_teams_sql:
        f.write(
            "INSERT INTO tournament_teams (\n"
            "    tournament_id,\n"
            "    team_id,\n"
            '    "group"\n'
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(tournament_teams_sql))

        f.write("\nON CONFLICT (tournament_id, team_id)\nDO NOTHING;\n\n")

    f.write("COMMIT TRANSACTION;\n")

print("teams_seed.sql generated successfully")
