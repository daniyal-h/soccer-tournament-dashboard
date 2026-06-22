import sys
import time
from decimal import Decimal, InvalidOperation
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.football_api_client import football_get

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = GENERATED_SEEDS_DIR / "player_leaderboards.sql"

LEADERBOARD_ENDPOINTS = {
    "goals": "/players/topscorers",
    "assists": "/players/topassists",
    "yellow_cards": "/players/topyellowcards",
}


def escape_sql(value: str | None) -> str:
    return (value or "").replace("'", "''")


def nullable_int(value: object) -> str:
    if value is None or value == "":
        return "NULL"

    try:
        return str(int(value))
    except (TypeError, ValueError):
        return "NULL"


def nullable_numeric(value: object) -> str:
    if value is None or value == "":
        return "NULL"

    try:
        return str(Decimal(str(value)).quantize(Decimal("0.01")))
    except (InvalidOperation, ValueError):
        return "NULL"


def get_leaderboard_value(category: str, stats: dict) -> int:
    goals = stats.get("goals") or {}
    cards = stats.get("cards") or {}

    if category == "goals":
        return goals.get("total") or 0

    if category == "assists":
        return goals.get("assists") or 0

    if category == "yellow_cards":
        return cards.get("yellow") or 0

    return 0


leaderboard_seen = set()
leaderboard_sql = []

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    for category, endpoint in LEADERBOARD_ENDPOINTS.items():
        params = {
            "league": tournament_api_id,
            "season": season,
        }

        data = football_get(endpoint, params)

        for rank, entry in enumerate(data.get("response", []), start=1):
            player = entry.get("player") or {}
            statistics_rows = entry.get("statistics") or []

            external_player_id = player.get("id")

            if external_player_id is None:
                continue

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

                leaderboard_key = (
                    tournament_api_id,
                    season,
                    category,
                    external_player_id,
                )

                if leaderboard_key in leaderboard_seen:
                    continue

                leaderboard_seen.add(leaderboard_key)

                tournament_id_sql = (
                    "(SELECT id FROM tournaments "
                    f"WHERE external_api_id = {tournament_api_id} "
                    f"AND season = '{escape_sql(season)}')"
                )

                team_id_sql = (
                    f"(SELECT id FROM teams WHERE external_api_id = {external_team_id})"
                )

                player_id_sql = (
                    "(SELECT id FROM players "
                    f"WHERE external_api_id = {external_player_id})"
                )

                value = get_leaderboard_value(category, stats)

                leaderboard_sql.append(
                    f"({tournament_id_sql}, "
                    f"{team_id_sql}, "
                    f"{player_id_sql}, "
                    f"'{category}', "
                    f"{rank}, "
                    f"{value}, "
                    f"{nullable_int(games.get('appearences'))}, "
                    f"{nullable_int(games.get('minutes'))}, "
                    f"{nullable_numeric(games.get('rating'))})"
                )

        time.sleep(0.5)


with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if leaderboard_sql:
        f.write(
            "INSERT INTO player_leaderboards (\n"
            "    tournament_id,\n"
            "    team_id,\n"
            "    player_id,\n"
            "    category,\n"
            "    rank,\n"
            "    value,\n"
            "    appearances,\n"
            "    minutes_played,\n"
            "    rating\n"
            ")\n"
            "VALUES\n"
        )

        f.write(",\n".join(leaderboard_sql))

        f.write(
            "\nON CONFLICT (tournament_id, category, player_id)\n"
            "DO UPDATE SET\n"
            "    team_id = EXCLUDED.team_id,\n"
            "    rank = EXCLUDED.rank,\n"
            "    value = EXCLUDED.value,\n"
            "    appearances = EXCLUDED.appearances,\n"
            "    minutes_played = EXCLUDED.minutes_played,\n"
            "    rating = EXCLUDED.rating;\n\n"
        )

    f.write("COMMIT TRANSACTION;\n")

print("player_leaderboards.sql generated successfully")
