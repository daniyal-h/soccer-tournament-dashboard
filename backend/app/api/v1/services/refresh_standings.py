from sqlalchemy.orm import Session

from app.api.v1.clients.football_api import football_get
from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.services import standings as standings_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.external_apis import API_FOOTBALL_STANDINGS_ENDPOINT
from app.models.enums import JobName
from app.models.tournament import Tournament
from app.schemas.standings import StandingRefreshRow
from app.utils.refresh_summary import RefreshSummary


def transform_standings_response(response: dict) -> list[StandingRefreshRow]:
    standings_data = []
    standings_groups = response["league"].get("standings", [])

    for group_rows in standings_groups:
        for row in group_rows:
            raw_group = row.get("group") or ""
            group = raw_group.split()[-1] if raw_group else ""

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
    Track job in refresh jobs table.
    """
    job_id = refresh_jobs_repo.create_job(db, JobName.STANDINGS_REFRESH)
    summary = RefreshSummary(resource_name="Standings")

    try:
        # entire command fails, mark job failed and crash
        tournaments = tournaments_service.get_refreshable_tournaments(db, margin_days)
        summary.tournaments_checked = len(tournaments)

        # upsert new standings data into each tournament
        # every step adds to the summary
        for tournament in tournaments:
            try:
                rows = get_standings_for_tournament(tournament)

                if not rows:
                    summary.mark_skipped()
                    continue

                standings_service.update_standings(db, tournament.id, rows)
                summary.mark_refreshed(rows_count=len(rows))

            except Exception as exc:
                summary.add_failure(
                    tournament_id=tournament.id,
                    external_api_id=tournament.external_api_id,
                    season=tournament.season,
                    reason=str(exc),
                )

        success = not summary.has_failures()
        result = summary.to_dict()

    except Exception:
        refresh_jobs_repo.complete_job(db, job_id, success=False)
        raise

    refresh_jobs_repo.complete_job(db, job_id, success=success)
    return result
