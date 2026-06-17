from sqlalchemy.orm import Session

from app.api.v1.clients.football_api import football_get
from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.services import match_events as match_events_service
from app.api.v1.services import matches as matches_service
from app.constants.external_apis import (
    API_EVENT_DETAIL_MISSED_PENALTY,
    API_EVENT_DETAIL_OWN_GOAL,
    API_EVENT_DETAIL_PENALTY,
    API_EVENT_DETAIL_RED_CARD,
    API_EVENT_DETAIL_YELLOW_CARD,
    API_EVENT_TYPE_CARD,
    API_EVENT_TYPE_GOAL,
    API_EVENT_TYPE_SUBSTITUTION,
    API_EVENT_TYPE_VAR,
    API_FOOTBALL_EVENTS_ENDPOINT,
)
from app.models.enums import EventType, JobName
from app.schemas.match_events import MatchEventRefreshRow
from app.utils.refresh_summary import RefreshSummary


def normalize(value: str | None) -> str:
    return (value or "").strip().lower()


# convert API-Football raw event types to backend event types
def map_event_type(raw_type: str | None, detail: str | None) -> EventType:
    event_type = normalize(raw_type)
    event_detail = normalize(detail)

    if event_type == API_EVENT_TYPE_GOAL:
        if event_detail == API_EVENT_DETAIL_OWN_GOAL:
            return EventType.OWN_GOAL

        if event_detail == API_EVENT_DETAIL_PENALTY:
            return EventType.PENALTY_GOAL

        if event_detail == API_EVENT_DETAIL_MISSED_PENALTY:
            return EventType.PENALTY_MISS

        return EventType.GOAL

    if event_type == API_EVENT_TYPE_CARD:
        if event_detail == API_EVENT_DETAIL_YELLOW_CARD:
            return EventType.YELLOW_CARD

        if event_detail == API_EVENT_DETAIL_RED_CARD:
            return EventType.RED_CARD

        return EventType.OTHER

    if event_type == API_EVENT_TYPE_SUBSTITUTION:
        return EventType.SUBSTITUTION

    if event_type == API_EVENT_TYPE_VAR:
        return EventType.VAR

    return EventType.OTHER


# transform API-Football data into refresh rows
def transform_match_event(match_external_api_id: int, event_row: dict) -> MatchEventRefreshRow:
    time_info = event_row.get("time") or {}
    team = event_row.get("team") or {}
    player = event_row.get("player") or {}
    assist = event_row.get("assist") or {}

    detail = event_row.get("detail")

    return MatchEventRefreshRow(
        external_match_id=match_external_api_id,
        external_team_id=team["id"],
        player_external_id=player.get("id"),
        secondary_player_external_id=assist.get("id"),
        player_name=player.get("name"),
        secondary_player_name=assist.get("name"),
        event_type=map_event_type(event_row.get("type"), detail),
        minute=time_info["elapsed"],
        extra_minute=time_info.get("extra"),
        detail=detail,
        comments=event_row.get("comments"),
    )


# fetch from API-Football and return refresh rows
def fetch_match_events_for_match(match) -> list[MatchEventRefreshRow]:
    data = football_get(
        API_FOOTBALL_EVENTS_ENDPOINT,
        {
            "fixture": match.external_api_id,
        },
    )

    responses = data.get("response", [])

    if not responses:
        return []

    return [transform_match_event(match.external_api_id, row) for row in responses]


def refresh_match_events(db: Session) -> dict:
    """
    Get all currently event-refreshable matches.
    Fetch events from API-Football.
    Transform events into MatchEventRefreshRow objects.
    Replace match events for each match.
    Return a refresh summary.
    Track job in refresh jobs table.
    """
    job_id = refresh_jobs_repo.create_job(db, JobName.MATCH_EVENTS_REFRESH)
    summary = RefreshSummary(resource_name="Match Events")

    try:
        # entire command fails, mark job failed and crash
        matches = matches_service.get_live_matches(db)
        summary.tournaments_checked = len(matches)

        for match in matches:
            # individual match fails --> keep going but mark failed
            try:
                rows = fetch_match_events_for_match(match)

                if not rows:
                    summary.mark_skipped()
                    continue

                match_events_service.update_match_events(db, match.id, rows)
                summary.mark_refreshed(rows_count=len(rows))

            except Exception as exc:
                summary.add_failure(
                    tournament_id=match.tournament_id,
                    external_api_id=match.external_api_id,
                    season=None,
                    reason=str(exc),
                )

        success = not summary.has_failures()
        result = summary.to_dict()

    except Exception:
        refresh_jobs_repo.complete_job(db, job_id, success=False)
        raise

    refresh_jobs_repo.complete_job(db, job_id, success=success)
    return result
