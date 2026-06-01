import sys
import time
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.matches import (
    CANCELLED_STATUS_SHORT_CODES,
    FINISHED_STATUS_SHORT_CODES,
    LIVE_STATUS_SHORT_CODES,
    POSTPONED_STATUS_SHORT_CODES,
    SCHEDULED_STATUS_SHORT_CODES,
)
from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.football_api_client import football_get

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = GENERATED_SEEDS_DIR / "matches.sql"


def escape_sql(value: str | None) -> str:
    return (value or "").replace("'", "''")


def sql_nullable_string(value: str | None) -> str:
    if value is None:
        return "NULL"

    return f"'{escape_sql(value)}'"


def sql_nullable_int(value: int | None) -> str:
    if value is None:
        return "NULL"

    return str(value)


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

    return "scheduled"


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


matches_sql = []

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    params = {
        "league": tournament_api_id,
        "season": season,
    }

    data = football_get("/fixtures", params)
    responses = data.get("response", [])

    if not responses:
        continue

    tournament_id_sql = (
        "(SELECT id FROM tournaments "
        f"WHERE external_api_id = {tournament_api_id} "
        f"AND season = '{escape_sql(season)}')"
    )

    for row in responses:
        fixture = row["fixture"]
        league = row["league"]
        teams = row["teams"]
        goals = row["goals"]
        score = row["score"] or {}
        penalty = score.get("penalty") or {}

        external_api_id = fixture["id"]
        external_team_a_id = teams["home"]["id"]
        external_team_b_id = teams["away"]["id"]

        team_a_id_sql = (
            f"(SELECT id FROM teams WHERE external_api_id = {external_team_a_id})"
        )
        team_b_id_sql = (
            f"(SELECT id FROM teams WHERE external_api_id = {external_team_b_id})"
        )

        kickoff_time = datetime.fromisoformat(fixture["date"]).isoformat()
        stage = map_fixture_stage(league.get("round"))
        status = map_fixture_status(fixture.get("status", {}))

        if stage == "group":
            group_sql = (
                '(SELECT tt_a."group" '
                "FROM tournament_teams tt_a "
                "JOIN tournament_teams tt_b "
                "ON tt_a.tournament_id = tt_b.tournament_id "
                'AND tt_a."group" = tt_b."group" '
                f"WHERE tt_a.tournament_id = {tournament_id_sql} "
                f"AND tt_a.team_id = {team_a_id_sql} "
                f"AND tt_b.team_id = {team_b_id_sql} "
                "LIMIT 1)"
            )
        else:
            group_sql = "NULL"

        venue = fixture.get("venue", {}).get("name")
        city = fixture.get("venue", {}).get("city")
        elapsed = fixture.get("status", {}).get("elapsed")
        team_a_score = goals.get("home")
        team_b_score = goals.get("away")
        team_a_penalties = penalty.get("home")
        team_b_penalties = penalty.get("away")

        matches_sql.append(
            f"({external_api_id}, {tournament_id_sql}, "
            f"{team_a_id_sql}, {team_b_id_sql}, "
            f"'{escape_sql(kickoff_time)}', "
            f"'{stage}', {group_sql}, '{status}', "
            f"{sql_nullable_string(venue)}, "
            f"{sql_nullable_string(city)}, "
            f"{sql_nullable_int(elapsed)}, "
            f"{sql_nullable_int(team_a_score)}, "
            f"{sql_nullable_int(team_b_score)}), "
            f"{sql_nullable_int(team_a_penalties)}, "
            f"{sql_nullable_int(team_b_penalties)}"
        )

    time.sleep(0.5)  # API-Football rate limits

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if matches_sql:
        f.write(
            "INSERT INTO matches (\n"
            "    external_api_id,\n"
            "    tournament_id,\n"
            "    team_a_id,\n"
            "    team_b_id,\n"
            "    kickoff_time,\n"
            "    stage,\n"
            '    "group",\n'
            "    status,\n"
            "    venue,\n"
            "    city,\n"
            "    elapsed,\n"
            "    team_a_score,\n"
            "    team_b_score\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(matches_sql))

        f.write(
            "\nON CONFLICT (external_api_id)\n"
            "DO UPDATE SET\n"
            "    tournament_id = EXCLUDED.tournament_id,\n"
            "    team_a_id = EXCLUDED.team_a_id,\n"
            "    team_b_id = EXCLUDED.team_b_id,\n"
            "    kickoff_time = EXCLUDED.kickoff_time,\n"
            "    stage = EXCLUDED.stage,\n"
            '    "group" = EXCLUDED."group",\n'
            "    status = EXCLUDED.status,\n"
            "    venue = EXCLUDED.venue,\n"
            "    city = EXCLUDED.city,\n"
            "    elapsed = EXCLUDED.elapsed,\n"
            "    team_a_score = EXCLUDED.team_a_score,\n"
            "    team_b_score = EXCLUDED.team_b_score;\n\n"
        )

    f.write("COMMIT TRANSACTION;\n")

print("matches.sql generated successfully")
