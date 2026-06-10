import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[3]))

from database.constants.tournaments import SUPPORTED_TOURNAMENTS
from database.utils.football_api_client import football_get

SCRIPT_DIR = Path(__file__).resolve().parent
SCRIPTS_DIR = SCRIPT_DIR.parent

GENERATED_SEEDS_DIR = SCRIPTS_DIR / "seeds" / "generated"
GENERATED_SEEDS_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_FILE = GENERATED_SEEDS_DIR / "tournament_team_ranks.sql"


def escape_sql(value: str | None) -> str:
    return (value or "").replace("'", "''")


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


def get_match_winner_and_loser(row: dict) -> tuple[int | None, int | None]:
    teams = row["teams"]
    goals = row["goals"] or {}
    score = row.get("score") or {}
    penalties = score.get("penalty") or {}

    home_team_id = teams["home"]["id"]
    away_team_id = teams["away"]["id"]

    home_goals = goals.get("home")
    away_goals = goals.get("away")

    if home_goals is None or away_goals is None:
        return None, None

    if home_goals > away_goals:
        return home_team_id, away_team_id

    if away_goals > home_goals:
        return away_team_id, home_team_id

    home_penalties = penalties.get("home")
    away_penalties = penalties.get("away")

    if home_penalties is None or away_penalties is None:
        return None, None

    if home_penalties > away_penalties:
        return home_team_id, away_team_id

    if away_penalties > home_penalties:
        return away_team_id, home_team_id

    return None, None


def get_group_stage_sort_key(
    team_id: int, standings_by_team_id: dict[int, dict]
) -> tuple:
    standing = standings_by_team_id.get(team_id, {})

    return (
        -(standing.get("points") or 0),
        -(standing.get("goal_difference") or 0),
        -(standing.get("goals_for") or 0),
        standing.get("team_name") or "",
    )


def assign_exact_rank(
    ranks_by_team_id: dict[int, dict],
    team_id: int | None,
    rank: int,
    eliminated_stage: str,
) -> None:
    if team_id is None:
        return

    ranks_by_team_id[team_id] = {
        "final_rank": rank,
        "eliminated_stage": eliminated_stage,
    }


def assign_rank_bucket(
    ranks_by_team_id: dict[int, dict],
    team_ids: list[int],
    starting_rank: int,
    eliminated_stage: str,
    standings_by_team_id: dict[int, dict],
) -> int:
    unique_unranked_team_ids = sorted(
        {team_id for team_id in team_ids if team_id not in ranks_by_team_id},
        key=lambda team_id: get_group_stage_sort_key(team_id, standings_by_team_id),
    )

    for index, team_id in enumerate(unique_unranked_team_ids):
        ranks_by_team_id[team_id] = {
            "final_rank": starting_rank + index,
            "eliminated_stage": eliminated_stage,
        }

    return starting_rank + len(unique_unranked_team_ids)


def tournament_id_sql(tournament_api_id: int, season: str) -> str:
    return (
        "(SELECT id FROM tournaments "
        f"WHERE external_api_id = {tournament_api_id} "
        f"AND season = '{escape_sql(season)}')"
    )


def team_id_sql(external_team_id: int) -> str:
    return f"(SELECT id FROM teams WHERE external_api_id = {external_team_id})"


def build_update_sql(
    tournament_api_id: int,
    season: str,
    external_team_id: int,
    final_rank: int,
    eliminated_stage: str,
) -> str:
    return (
        "UPDATE tournament_teams\n"
        "SET\n"
        f"    final_rank = {final_rank},\n"
        f"    eliminated_stage = '{escape_sql(eliminated_stage)}'\n"
        f"WHERE tournament_id = {tournament_id_sql(tournament_api_id, season)}\n"
        f"AND team_id = {team_id_sql(external_team_id)};"
    )


rank_updates_sql = []

for _, tournament_api_id, season, _ in SUPPORTED_TOURNAMENTS:
    params = {
        "league": tournament_api_id,
        "season": season,
    }

    standings_data = football_get("/standings", params)
    standings_responses = standings_data.get("response", [])

    if not standings_responses:
        continue

    standings_by_team_id = {}
    all_team_ids = set()

    standings_groups = standings_responses[0]["league"].get("standings", [])

    for group_rows in standings_groups:
        for row in group_rows:
            team = row["team"]
            all_stats = row.get("all") or {}
            goals = all_stats.get("goals") or {}

            external_team_id = team["id"]
            goals_for = goals.get("for") or 0
            goals_against = goals.get("against") or 0

            standings_by_team_id[external_team_id] = {
                "team_name": team.get("name") or "",
                "points": row.get("points") or 0,
                "goal_difference": goals_for - goals_against,
                "goals_for": goals_for,
            }

            all_team_ids.add(external_team_id)

    fixtures_data = football_get("/fixtures", params)
    fixture_responses = fixtures_data.get("response", [])

    matches_by_stage = {
        "final": [],
        "third_place": [],
        "semi_final": [],
        "quarter_final": [],
        "round_of_16": [],
        "round_of_32": [],
    }

    for row in fixture_responses:
        fixture = row["fixture"]
        league = row["league"]
        status = fixture.get("status", {})
        status_short = (status.get("short") or "").strip().upper()

        if status_short not in {"FT", "AET", "PEN"}:
            continue

        stage = map_fixture_stage(league.get("round"))

        if stage in matches_by_stage:
            matches_by_stage[stage].append(row)

    ranks_by_team_id = {}

    final_matches = matches_by_stage["final"]

    if final_matches:
        winner_id, loser_id = get_match_winner_and_loser(final_matches[-1])

        assign_exact_rank(ranks_by_team_id, winner_id, 1, "champion")
        assign_exact_rank(ranks_by_team_id, loser_id, 2, "final")

        next_rank = 3
    else:
        next_rank = 1

    third_place_matches = matches_by_stage["third_place"]

    if third_place_matches:
        winner_id, loser_id = get_match_winner_and_loser(third_place_matches[-1])

        assign_exact_rank(ranks_by_team_id, winner_id, next_rank, "third_place_winner")
        assign_exact_rank(ranks_by_team_id, loser_id, next_rank + 1, "third_place")

        next_rank += 2
    else:
        semi_final_losers = []

        for match in matches_by_stage["semi_final"]:
            _, loser_id = get_match_winner_and_loser(match)

            if loser_id is not None:
                semi_final_losers.append(loser_id)

        next_rank = assign_rank_bucket(
            ranks_by_team_id,
            semi_final_losers,
            next_rank,
            "semi_final",
            standings_by_team_id,
        )

    for stage in ["quarter_final", "round_of_16", "round_of_32"]:
        losers = []

        for match in matches_by_stage[stage]:
            _, loser_id = get_match_winner_and_loser(match)

            if loser_id is not None:
                losers.append(loser_id)

        next_rank = assign_rank_bucket(
            ranks_by_team_id,
            losers,
            next_rank,
            stage,
            standings_by_team_id,
        )

    group_exit_team_ids = [
        team_id for team_id in all_team_ids if team_id not in ranks_by_team_id
    ]

    assign_rank_bucket(
        ranks_by_team_id,
        group_exit_team_ids,
        next_rank,
        "group_stage",
        standings_by_team_id,
    )

    for external_team_id, rank_data in sorted(
        ranks_by_team_id.items(),
        key=lambda item: item[1]["final_rank"],
    ):
        rank_updates_sql.append(
            build_update_sql(
                tournament_api_id=tournament_api_id,
                season=season,
                external_team_id=external_team_id,
                final_rank=rank_data["final_rank"],
                eliminated_stage=rank_data["eliminated_stage"],
            )
        )

    time.sleep(0.5)  # API-Football rate limits

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("BEGIN TRANSACTION;\n\n")

    if rank_updates_sql:
        f.write("\n\n".join(rank_updates_sql))
        f.write("\n\n")

    f.write("COMMIT TRANSACTION;\n")

print("tournament_team_ranks.sql generated successfully")
