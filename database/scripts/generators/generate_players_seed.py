import sys
import time
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.football_api_client import football_get

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

PLAYERS_OUTPUT = GENERATED_SEEDS_DIR / "players.sql"
TEAM_PLAYERS_OUTPUT = GENERATED_SEEDS_DIR / "team_players.sql"


def escape_sql(value: str | None) -> str:
    return (value or "").replace("'", "''")


def nullable_string(value: str | None) -> str:
    if value is None or value == "":
        return "NULL"

    return f"'{escape_sql(value)}'"


def nullable_int(value: object) -> str:
    if value is None or value == "":
        return "NULL"

    try:
        return str(int(value))
    except (TypeError, ValueError):
        return "NULL"


def nullable_date(value: str | None) -> str:
    if not value:
        return "NULL"

    try:
        date.fromisoformat(value)
    except ValueError:
        return "NULL"

    return f"'{escape_sql(value)}'"


def normalize_height(value: str | None) -> int | None:
    if not value:
        return None

    cleaned = value.lower().replace("cm", "").strip()

    try:
        return int(cleaned)
    except ValueError:
        return None


def map_position(value: str | None) -> str | None:
    normalized = (value or "").strip().lower()

    if normalized == "goalkeeper":
        return "GK"

    if normalized == "defender":
        return "DEF"

    if normalized == "midfielder":
        return "MID"

    if normalized == "attacker":
        return "FWD"

    return None


players_seen = set()
team_players_seen = set()

players_sql = []
team_players_sql = []

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    page = 1
    total_pages = 1

    while page <= total_pages:
        params = {
            "league": tournament_api_id,
            "season": season,
            "page": page,
        }

        data = football_get("/players", params)

        paging = data.get("paging") or {}
        total_pages = paging.get("total") or 1

        for entry in data.get("response", []):
            player = entry.get("player") or {}
            statistics_rows = entry.get("statistics") or []

            external_player_id = player.get("id")

            if external_player_id not in players_seen:
                players_seen.add(external_player_id)

                display_name = player.get("name") or "Unknown Player"

                first_name = player.get("firstname")
                last_name = player.get("lastname")

                birth = player.get("birth") or {}
                birth_date = birth.get("date")

                height = normalize_height(player.get("height"))

                players_sql.append(
                    f"({external_player_id}, "
                    f"{nullable_string(display_name)}, "
                    f"{nullable_string(first_name)}, "
                    f"{nullable_string(last_name)}, "
                    f"{nullable_date(birth_date)}, "
                    f"{nullable_string(player.get('photo'))}, "
                    f"{nullable_string(player.get('nationality'))}, "
                    f"{nullable_int(height)})"
                )

            for stats in statistics_rows:
                team = stats.get("team") or {}
                league = stats.get("league") or {}
                games = stats.get("games") or {}

                external_team_id = team.get("id")

                if external_team_id is None:
                    continue

                if league.get("id") != tournament_api_id:
                    continue

                if str(league.get("season")) != str(season):
                    continue

                team_player_key = (
                    tournament_api_id,
                    season,
                    external_team_id,
                    external_player_id,
                )

                if team_player_key in team_players_seen:
                    continue

                team_players_seen.add(team_player_key)

                squad_number = games.get("number")
                position = map_position(games.get("position"))

                tournament_id_sql = (
                    "(SELECT id FROM tournaments "
                    f"WHERE external_api_id = {tournament_api_id} "
                    f"AND season = '{escape_sql(season)}')"
                )

                team_id_sql = (
                    f"(SELECT id FROM teams WHERE external_api_id = {external_team_id})"
                )

                player_id_sql = f"(SELECT id FROM players WHERE external_api_id = {external_player_id})"

                team_players_sql.append(
                    f"({tournament_id_sql}, "
                    f"{team_id_sql}, "
                    f"{player_id_sql}, "
                    f"{nullable_int(squad_number)}, "
                    f"{nullable_string(position)})"
                )

        page += 1
        time.sleep(0.5)  # API-Football rate limits


with open(PLAYERS_OUTPUT, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if players_sql:
        f.write(
            "INSERT INTO players (\n"
            "    external_api_id,\n"
            "    display_name,\n"
            "    first_name,\n"
            "    last_name,\n"
            "    date_of_birth,\n"
            "    photo_url,\n"
            "    nationality,\n"
            "    height\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(players_sql))

        f.write(
            "\nON CONFLICT (external_api_id)\n"
            "DO UPDATE SET\n"
            "    display_name = EXCLUDED.display_name,\n"
            "    first_name = COALESCE(EXCLUDED.first_name, players.first_name),\n"
            "    last_name = COALESCE(EXCLUDED.last_name, players.last_name),\n"
            "    date_of_birth = COALESCE(EXCLUDED.date_of_birth, players.date_of_birth),\n"
            "    photo_url = COALESCE(EXCLUDED.photo_url, players.photo_url),\n"
            "    nationality = COALESCE(EXCLUDED.nationality, players.nationality),\n"
            "    height = COALESCE(EXCLUDED.height, players.height);\n\n"
        )

    f.write("COMMIT TRANSACTION;\n")


with open(TEAM_PLAYERS_OUTPUT, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if team_players_sql:
        f.write(
            "INSERT INTO team_players (\n"
            "    tournament_id,\n"
            "    team_id,\n"
            "    player_id,\n"
            "    squad_number,\n"
            "    position\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(team_players_sql))

        f.write(
            "\nON CONFLICT (tournament_id, team_id, player_id)\n"
            "DO UPDATE SET\n"
            "    squad_number = EXCLUDED.squad_number,\n"
            "    position = EXCLUDED.position;\n\n"
        )

    f.write("COMMIT TRANSACTION;\n")


print("players.sql generated successfully")
print("team_players.sql generated successfully")
