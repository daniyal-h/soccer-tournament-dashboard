from datetime import datetime

from sqlalchemy.orm import Session

from app.api.v1.clients.football_api import football_get
from app.api.v1.services import matches as matches_service
from app.api.v1.services import tournaments as tournaments_service
from app.constants.external_apis import (
    API_FOOTBALL_FIXTURES_ENDPOINT,
    CANCELLED_STATUS_SHORT_CODES,
    FINISHED_STATUS_SHORT_CODES,
    LIVE_STATUS_SHORT_CODES,
    MATCHES_MARGIN_DAYS,
    POSTPONED_STATUS_SHORT_CODES,
    SCHEDULED_STATUS_SHORT_CODES,
)
from app.schemas.matches import MatchRefreshRow
from app.utils.refresh_summary import RefreshSummary


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


def transform_fixture(fixture_row: dict) -> MatchRefreshRow:
    fixture = fixture_row["fixture"]
    league = fixture_row["league"]
    teams = fixture_row["teams"]
    goals = fixture_row.get("goals") or {}
    score = fixture_row.get("score") or {}
    penalty = score.get("penalty") or {}

    return MatchRefreshRow(
        external_api_id=fixture["id"],
        external_team_a_id=teams["home"]["id"],
        external_team_b_id=teams["away"]["id"],
        kickoff_time=datetime.fromisoformat(fixture["date"]),
        stage=map_fixture_stage(league.get("round")),
        status=map_fixture_status(fixture.get("status", {})),
        venue=(fixture.get("venue") or {}).get("name"),
        city=(fixture.get("venue") or {}).get("city"),
        elapsed=(fixture.get("status") or {}).get("elapsed"),
        team_a_score=goals.get("home"),
        team_b_score=goals.get("away"),
        team_a_penalties=penalty.get("home"),
        team_b_penalties=penalty.get("away"),
    )


def fetch_matches_for_tournament(tournament) -> list[MatchRefreshRow]:
    data = football_get(
        API_FOOTBALL_FIXTURES_ENDPOINT,
        {
            "league": tournament.external_api_id,
            "season": tournament.season,
        },
    )

    responses = data.get("response", [])

    if not responses:
        return []

    return [transform_fixture(row) for row in responses]


def refresh_matches(db: Session, margin_days: int = MATCHES_MARGIN_DAYS) -> dict:
    """
    Get all refreshable tournaments with the given margin.
    Fetch fixtures from API-Football.
    Transform fixtures into MatchesRefreshRow objects.
    Upsert matches for each tournament.
    Return a refresh summary.
    """
    tournaments = tournaments_service.get_refreshable_tournaments(db, margin_days)

    summary = RefreshSummary(resource_name="Matches", tournaments_checked=len(tournaments))

    # upsert new matches data into each tournament
    # every step adds to the summary
    for tournament in tournaments:
        try:
            rows = fetch_matches_for_tournament(tournament)

            if not rows:
                summary.mark_skipped()
                continue

            matches_service.update_matches(db, tournament.id, rows)
            summary.mark_refreshed(rows_count=len(rows))

        except Exception as exc:
            summary.add_failure(
                tournament_id=tournament.id,
                external_api_id=tournament.external_api_id,
                season=tournament.season,
                reason=str(exc),
            )

    return summary.to_dict()
