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

TOURNAMENT_TEAMS_OUTPUT = GENERATED_SEEDS_DIR / "tournament_teams.sql"
STANDINGS_OUTPUT = GENERATED_SEEDS_DIR / "standings.sql"


def escape_sql(value: str | None) -> str:
    return (value or "").replace("'", "''")


tournament_teams_sql = []
standings_sql = []

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    params = {
        "league": tournament_api_id,
        "season": season,
    }

    data = api_get("/standings", params)
    responses = data.get("response", [])

    if not responses:
        continue

    standings_groups = responses[0]["league"].get("standings", [])

    for group_rows in standings_groups:
        for row in group_rows:
            team = row["team"]

            external_team_id = team["id"]
            raw_group = row.get("group") or ""

            group_name = raw_group.replace("Group ", "").strip()

            # only allow for single-letter group classifications
            if len(group_name) != 1 or not group_name.isalpha():
                continue

            group_name = escape_sql(group_name.upper())

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

    time.sleep(0.5)  # API-Football rate limits

with open(TOURNAMENT_TEAMS_OUTPUT, "w", encoding="utf-8") as f:
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

    f.write("COMMIT TRANSACTION;\n")


with open(STANDINGS_OUTPUT, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

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


print("tournament_teams.sql generated successfully")
print("standings.sql generated successfully")
