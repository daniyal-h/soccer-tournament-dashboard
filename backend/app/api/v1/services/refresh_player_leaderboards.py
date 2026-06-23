from decimal import Decimal, InvalidOperation

from sqlalchemy.orm import Session

from app.api.v1.clients.football_api import football_get
from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.services import player_leaderboards as player_leaderboards_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.external_apis import LEADERBOARD_ENDPOINTS
from app.models.enums import JobName
from app.models.tournament import Tournament
from app.schemas.player_leaderboards import PlayerLeaderboardRefreshRow
from app.utils.refresh_summary import RefreshSummary


def nullable_int(value: object) -> int | None:
    if value is None or value == "":
        return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def nullable_numeric(value: object) -> Decimal | None:
    if value is None or value == "":
        return None

    try:
        return float(Decimal(str(value)).quantize(Decimal("0.01")))
    except (InvalidOperation, ValueError):
        return None


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


def fetch_player_leaderboards_for_tournament(
    tournament: Tournament,
) -> list[PlayerLeaderboardRefreshRow]:
    """
    Get the leaderboards for the specified tournaments.
    Since the response are equivalent in shape, simple for-loop all endpoints.
    Transform the response shape to refresh row shape.
    """
    rows: list[PlayerLeaderboardRefreshRow] = []
    leaderboard_seen = set()

    for category, endpoint in LEADERBOARD_ENDPOINTS.items():
        params = {
            "league": tournament.external_api_id,
            "season": tournament.season,
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

                if league.get("id") != tournament.external_api_id:
                    continue

                if str(league.get("season")) != str(tournament.season):
                    continue

                leaderboard_key = (
                    tournament.external_api_id,
                    tournament.season,
                    category,
                    external_player_id,
                )

                if leaderboard_key in leaderboard_seen:
                    continue

                leaderboard_seen.add(leaderboard_key)

                rows.append(
                    PlayerLeaderboardRefreshRow(
                        external_team_id=external_team_id,
                        external_player_id=external_player_id,
                        category=category,
                        rank=rank,
                        value=get_leaderboard_value(category, stats),
                        appearances=nullable_int(games.get("appearences")),
                        minutes_played=nullable_int(games.get("minutes")),
                        rating=nullable_numeric(games.get("rating")),
                    )
                )

    return rows


def refresh_player_leaderboards(db: Session) -> dict:
    """
    Get all refreshable tournaments.
    Fetch leaderboard statics from API-Football
    for top scorers, assists and yellow cards.
    Transform each leaderboard into PlayerLeaderboardRefreshRow objects.
    Update leaderboards for each tournament and return a refresh summary.
    """
    job_id = refresh_jobs_repo.create_job(db, JobName.PLAYER_LEADERBOARDS_REFRESH)
    summary = RefreshSummary(resource_name="Player Leaderboards")

    try:
        # entire command fails, mark job failed and crash
        tournaments = tournaments_service.get_refreshable_tournaments(db, margin_days=0)
        summary.tournaments_checked = len(tournaments)

        # update new leaderboards data into each tournament
        # every step adds to the summary
        for tournament in tournaments:
            try:
                rows = fetch_player_leaderboards_for_tournament(tournament)

                if not rows:
                    summary.mark_skipped()
                    continue

                player_leaderboards_service.update_player_leaderboards(db, tournament.id, rows)
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
