from datetime import date

from sqlalchemy.orm import Session

from app.api.v1.clients.football_api import football_get
from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.services import team_players as team_players_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.external_apis import API_FOOTBALL_PLAYERS_ENDPOINT, TEAM_SQUADS_MARGIN_DAYS
from app.models.enums import JobName
from app.schemas.teams import TeamPlayerRefreshRow
from app.utils.refresh_summary import RefreshSummary


def normalize_height(value: str | None) -> int | None:
    if not value:
        return None

    cleaned = value.lower().replace("cm", "").strip()

    try:
        return int(cleaned)
    except ValueError:
        return None


def parse_birth_date(value: str | None) -> date | None:
    if not value:
        return None

    try:
        return date.fromisoformat(value)
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


def transform_team_squads_data_row(
    row: dict,
    tournament_external_api_id: int,
    season: str,
) -> list[TeamPlayerRefreshRow]:
    player = row.get("player") or {}
    statistics_rows = row.get("statistics") or []

    external_player_id = player.get("id")

    if external_player_id is None:
        return []

    birth = player.get("birth") or {}

    rows = []

    for stats in statistics_rows:
        team = stats.get("team") or {}
        league = stats.get("league") or {}
        games = stats.get("games") or {}

        external_team_id = team.get("id")

        if external_team_id is None:
            continue

        if league.get("id") != tournament_external_api_id:
            continue

        if str(league.get("season")) != str(season):
            continue

        rows.append(
            TeamPlayerRefreshRow(
                external_player_id=external_player_id,
                external_team_id=external_team_id,
                display_name=player.get("name") or "Unknown Player",
                first_name=player.get("firstname"),
                last_name=player.get("lastname"),
                date_of_birth=parse_birth_date(birth.get("date")),
                photo_url=player.get("photo"),
                nationality=player.get("nationality"),
                height=normalize_height(player.get("height")),
                squad_number=games.get("number"),
                position=map_position(games.get("position")),
            )
        )

    return rows


def fetch_squad_data_for_tournament(tournament) -> list[TeamPlayerRefreshRow]:
    """
    Fetch team squad data through the players/statistics endpoint.
    Ensure to loop through all pages for every tournament.
    """
    rows = []
    seen_team_players = set()

    page = 1
    total_pages = 1

    while page <= total_pages:
        data = football_get(
            API_FOOTBALL_PLAYERS_ENDPOINT,
            {
                "league": tournament.external_api_id,
                "season": tournament.season,
                "page": page,
            },
        )

        paging = data.get("paging") or {}
        total_pages = paging.get("total") or 1

        for entry in data.get("response", []):
            transformed_rows = transform_team_squads_data_row(
                entry,
                tournament_external_api_id=tournament.external_api_id,
                season=tournament.season,
            )

            for row in transformed_rows:
                key = (
                    row.external_team_id,
                    row.external_player_id,
                )

                if key in seen_team_players:
                    continue

                seen_team_players.add(key)
                rows.append(row)

        page += 1

    return rows


def refresh_team_squads(
    db: Session,
    margin_days: int = TEAM_SQUADS_MARGIN_DAYS,
) -> dict:
    """
    Get all refreshable tournaments.
    Fetch paginated player statistics data from API-Football.
    Transform rows into player/team-player refresh rows.
    Upsert players and tournament-scoped team player registrations.
    Later this same API sweep can also upsert player_stats.
    """
    job_id = refresh_jobs_repo.create_job(db, JobName.TEAM_SQUADS_REFRESH)
    summary = RefreshSummary(resource_name="Player Data")

    try:
        tournaments = tournaments_service.get_refreshable_tournaments(db, margin_days)
        summary.tournaments_checked = len(tournaments)

        for tournament in tournaments:
            try:
                rows = fetch_squad_data_for_tournament(tournament)

                if not rows:
                    summary.mark_skipped()
                    continue

                team_players_service.update_team_players(
                    db=db,
                    tournament_id=tournament.id,
                    rows=rows,
                )

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
