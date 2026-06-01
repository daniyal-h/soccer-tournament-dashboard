from sqlalchemy.orm import Session

from app.api.v1.clients.football_api import football_get
from app.api.v1.services import standings as standings_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.external_apis import API_FOOTBALL_STANDINGS_ENDPOINT
from app.models.tournament import Tournament
from app.schemas.standings import StandingRefreshRow


def transform_standings_response(response: dict) -> list[StandingRefreshRow]:
    standings_data = []
    standings_groups = response["league"].get("standings", [])

    for group_rows in standings_groups:
        for row in group_rows:
            raw_group = row.get("group") or ""
            group = raw_group.replace("Group ", "").strip()

            if len(group) != 1 or not group.isalpha():
                continue

            all_stats = row.get("all") or {}
            goals = all_stats.get("goals") or {}

            standings_data.append(
                StandingRefreshRow(
                    external_team_id=row["team"]["id"],
                    group=group.upper(),
                    position=row.get("rank") or 0,
                    points=row.get("points") or 0,
                    wins=all_stats.get("win") or 0,
                    draws=all_stats.get("draw") or 0,
                    losses=all_stats.get("lose") or 0,
                    goals_for=goals.get("for") or 0,
                    goals_against=goals.get("against") or 0,
                )
            )

    return standings_data


def get_standings_for_tournament(tournament: Tournament) -> list[StandingRefreshRow]:
    """
    Retrieve standings through an API call for the given tournament.
    Return transformed data to be upserted.
    """
    data = football_get(
        API_FOOTBALL_STANDINGS_ENDPOINT,
        {
            "league": tournament.external_api_id,
            "season": tournament.season,
        },
    )

    responses = data.get("response", [])

    if not responses:
        return []

    return transform_standings_response(responses[0])


def refresh_standings(db: Session, margin_days: int) -> dict:
    """
    Get all refreshable tournaments with the given margin.
    Loop through each tournament and retrieve updated standings from Football-API.
    Upsert into Standings for each tournament.
    Handle single failures to augment summary, return 200 except for major error.
    Return the summary.
    """

    tournaments = tournaments_service.get_refreshable_tournaments(db, margin_days)

    # summary skeleton
    summary = {
        "message": "Standings refresh completed",
        "tournaments_checked": len(tournaments),
        "tournaments_refreshed": 0,
        "tournaments_skipped": 0,
        "rows_processed": 0,
        "failures": [],
    }

    # upsert new standings data into each tournament
    # every step adds to the summary
    for tournament in tournaments:
        try:
            rows = get_standings_for_tournament(tournament)

            if not rows:
                summary["tournaments_skipped"] += 1
                continue

            standings_service.update_standings(db, tournament.id, rows)

            summary["tournaments_refreshed"] += 1
            summary["rows_processed"] += len(rows)

        except Exception as exc:
            summary["failures"].append(
                {
                    "tournament_id": tournament.id,
                    "external_api_id": tournament.external_api_id,
                    "season": tournament.season,
                    "reason": str(exc),
                }
            )

    if summary["failures"]:
        summary["message"] = "Standings refresh completed with failures"

    return summary
