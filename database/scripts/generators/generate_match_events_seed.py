import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.match_events import (
    API_EVENT_DETAIL_MISSED_PENALTY,
    API_EVENT_DETAIL_OWN_GOAL,
    API_EVENT_DETAIL_PENALTY,
    API_EVENT_DETAIL_RED_CARD,
    API_EVENT_DETAIL_YELLOW_CARD,
    API_EVENT_TYPE_CARD,
    API_EVENT_TYPE_GOAL,
    API_EVENT_TYPE_SUBSTITUTION,
    API_EVENT_TYPE_VAR,
    EVENT_TYPE_GOAL,
    EVENT_TYPE_OTHER,
    EVENT_TYPE_OWN_GOAL,
    EVENT_TYPE_PENALTY_GOAL,
    EVENT_TYPE_PENALTY_MISS,
    EVENT_TYPE_RED_CARD,
    EVENT_TYPE_SUBSTITUTION,
    EVENT_TYPE_VAR,
    EVENT_TYPE_YELLOW_CARD,
)
from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.football_api_client import football_get

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = GENERATED_SEEDS_DIR / "match_events.sql"


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


def normalize(value: str | None) -> str:
    return (value or "").strip().lower()


def map_event_type(raw_type: str | None, detail: str | None) -> str:
    event_type = normalize(raw_type)
    event_detail = normalize(detail)

    if event_type == API_EVENT_TYPE_GOAL:
        if event_detail == API_EVENT_DETAIL_OWN_GOAL:
            return EVENT_TYPE_OWN_GOAL

        if event_detail == API_EVENT_DETAIL_PENALTY:
            return EVENT_TYPE_PENALTY_GOAL

        if event_detail == API_EVENT_DETAIL_MISSED_PENALTY:
            return EVENT_TYPE_PENALTY_MISS

        return EVENT_TYPE_GOAL

    if event_type == API_EVENT_TYPE_CARD:
        if event_detail == API_EVENT_DETAIL_YELLOW_CARD:
            return EVENT_TYPE_YELLOW_CARD

        if event_detail == API_EVENT_DETAIL_RED_CARD:
            return EVENT_TYPE_RED_CARD

        return EVENT_TYPE_OTHER

    if event_type == API_EVENT_TYPE_SUBSTITUTION:
        return EVENT_TYPE_SUBSTITUTION

    if event_type == API_EVENT_TYPE_VAR:
        return EVENT_TYPE_VAR

    return EVENT_TYPE_OTHER


match_events_sql = []
fixture_external_ids = set()

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    fixtures_data = football_get(
        "/fixtures",
        {
            "league": tournament_api_id,
            "season": season,
        },
    )

    fixtures = fixtures_data.get("response", [])

    if not fixtures:
        continue

    for fixture_row in fixtures:
        fixture = fixture_row["fixture"]
        fixture_external_id = fixture["id"]
        fixture_external_ids.add(fixture_external_id)

        events_data = football_get(
            "/fixtures/events",
            {
                "fixture": fixture_external_id,
            },
        )

        events = events_data.get("response", [])

        if not events:
            continue

        match_id_sql = (
            f"(SELECT id FROM matches WHERE external_api_id = {fixture_external_id})"
        )

        for event in events:
            time_info = event.get("time") or {}
            team = event.get("team") or {}
            player = event.get("player") or {}
            assist = event.get("assist") or {}

            external_team_id = team.get("id")
            team_id_sql = (
                f"(SELECT id FROM teams WHERE external_api_id = {external_team_id})"
            )

            detail = event.get("detail")
            comments = event.get("comments")
            event_type = map_event_type(event.get("type"), detail)

            match_events_sql.append(
                f"({match_id_sql}, "
                f"{team_id_sql}, "
                f"{sql_nullable_int(player.get('id'))}, "
                f"{sql_nullable_int(assist.get('id'))}, "
                f"{sql_nullable_string(player.get('name'))}, "
                f"{sql_nullable_string(assist.get('name'))}, "
                f"'{event_type}', "
                f"{sql_nullable_int(time_info.get('elapsed'))}, "
                f"{sql_nullable_int(time_info.get('extra'))}, "
                f"{sql_nullable_string(detail)}, "
                f"{sql_nullable_string(comments)})"
            )

        time.sleep(0.5)  # API-Football rate limits

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if fixture_external_ids:
        fixture_ids_sql = ", ".join(
            str(fixture_id) for fixture_id in sorted(fixture_external_ids)
        )

        f.write(
            "DELETE FROM match_events\n"
            "WHERE match_id IN (\n"
            "    SELECT id FROM matches\n"
            f"    WHERE external_api_id IN ({fixture_ids_sql})\n"
            ");\n\n"
        )

    if match_events_sql:
        f.write(
            "INSERT INTO match_events (\n"
            "    match_id,\n"
            "    team_id,\n"
            "    player_external_id,\n"
            "    secondary_player_external_id,\n"
            "    player_name,\n"
            "    secondary_player_name,\n"
            "    event_type,\n"
            "    minute,\n"
            "    extra_minute,\n"
            "    detail,\n"
            "    comments\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(match_events_sql))
        f.write(";\n\n")

    f.write("COMMIT TRANSACTION;\n")

print("match_events.sql generated successfully")
