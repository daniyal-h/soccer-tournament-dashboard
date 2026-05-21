import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = GENERATED_SEEDS_DIR / "standings.sql"

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


def escape_sql(value: str | None) -> str:
    return (value or "").replace("'", "''")


tournament_teams_sql = []
standings_sql = []

for tournament_api_id, season in TOURNAMENTS:
    response = requests.get(
        f"{BASE_URL}/standings",
        headers=HEADERS,
        params={
            "league": tournament_api_id,
            "season": season,
        },
        timeout=30,
    )

    response.raise_for_status()

    data = response.json()
    responses = data.get("response", [])

    if not responses:
        continue

    standings_groups = responses[0]["league"].get("standings", [])

    for group_rows in standings_groups:
        for row in group_rows:
            team = row["team"]

            external_team_id = team["id"]
            raw_group = row.get("group") or ""

            group_name = escape_sql(raw_group.replace("Group ", "").strip())

            if not group_name:
                continue

            rank = row.get("rank") or 0
            points = row.get("points") or 0
            all_stats = row.get("all") or {}

            wins = all_stats.get("win") or 0
            draws = all_stats.get("draw") or 0
            losses = all_stats.get("lose") or 0

            goals = all_stats.get("goals") or {}
            goals_for = goals.get("for") or 0
            goals_against = goals.get("against") or 0

            tournament_id_sql = (
                "(SELECT id FROM tournaments "
                f"WHERE external_api_id = {tournament_api_id} "
                f"AND season = '{escape_sql(season)}')"
            )

            team_id_sql = (
                f"(SELECT id FROM teams WHERE external_api_id = {external_team_id})"
            )

            tournament_teams_sql.append(
                f"({tournament_id_sql}, {team_id_sql}, '{group_name}')"
            )

            standings_sql.append(
                f"({tournament_id_sql}, {team_id_sql}, '{group_name}', "
                f"{rank}, {points}, {wins}, {draws}, {losses}, "
                f"{goals_for}, {goals_against})"
            )

    time.sleep(0.5)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

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

        f.write(
            "\nON CONFLICT (tournament_id, team_id)\n"
            "DO UPDATE SET\n"
            '    "group" = EXCLUDED."group";\n\n'
        )

    if standings_sql:
        f.write(
            "INSERT INTO standings (\n"
            "    tournament_id,\n"
            "    team_id,\n"
            '    "group",\n'
            "    position,\n"
            "    points,\n"
            "    wins,\n"
            "    draws,\n"
            "    losses,\n"
            "    goals_for,\n"
            "    goals_against\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(standings_sql))

        f.write(
            "\nON CONFLICT (tournament_id, team_id)\n"
            "DO UPDATE SET\n"
            '    "group" = EXCLUDED."group",\n'
            "    position = EXCLUDED.position,\n"
            "    points = EXCLUDED.points,\n"
            "    wins = EXCLUDED.wins,\n"
            "    draws = EXCLUDED.draws,\n"
            "    losses = EXCLUDED.losses,\n"
            "    goals_for = EXCLUDED.goals_for,\n"
            "    goals_against = EXCLUDED.goals_against;\n\n"
        )

    f.write("COMMIT TRANSACTION;\n")

print("standings.sql generated successfully")
