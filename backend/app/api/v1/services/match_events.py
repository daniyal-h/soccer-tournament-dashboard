from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import match_events as match_events_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import matches as matches_service
from app.api.v1.services import players as players_service
from app.api.v1.services import teams as teams_service
from app.api.v1.services.freshness.match_events import get_match_events_delay_metadata
from app.models.match import Match
from app.models.match_event import MatchEvent
from app.schemas.match_events import MatchEventRefreshRow, MatchEventsResponse
from app.utils.cache_helper import get_expires_at, get_match_events_ttl


def get_match_events(db: Session, match: Match) -> list[MatchEvent]:
    cache_key = f"match_events:{match.id}"
    cached = cache_service.get_cache(db, cache_key)

    if cached is not None:
        # cache stores serialized response-shaped data
        return cached

    match_events = match_events_repo.get_all_match_events(db, match.id)

    ttl = get_match_events_ttl(match, match_events)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(match_events), expires_at=get_expires_at(ttl)
    )

    return match_events


def get_match_events_response(db: Session, match_id: int) -> MatchEventsResponse:
    match = matches_service.get_match(db, match_id)  # also validates the ID
    events = get_match_events(db, match)
    metadata = get_match_events_delay_metadata(db, match)

    return MatchEventsResponse(data=events, metadata=metadata)


def update_match_events(
    db: Session,
    match_id: int,
    data: list[MatchEventRefreshRow],
) -> None:
    rows = []

    for row in data:
        # resolve team and player IDs
        team_id = teams_service.get_team_id_from_external_id(
            db,
            row.external_team_id,
        )

        print("Team ID:", team_id)

        player_id = players_service.get_optional_player_id_from_external_id(
            db,
            row.player_external_id,
        )

        secondary_player_id = players_service.get_optional_player_id_from_external_id(
            db,
            row.secondary_player_external_id,
        )

        # build the event and append it
        rows.append(
            MatchEvent(
                match_id=match_id,
                team_id=team_id,
                player_id=player_id,
                secondary_player_id=secondary_player_id,
                player_external_id=row.player_external_id,
                secondary_player_external_id=row.secondary_player_external_id,
                player_name=row.player_name,
                secondary_player_name=row.secondary_player_name,
                event_type=row.event_type,
                minute=row.minute,
                extra_minute=row.extra_minute,
                detail=row.detail,
                comments=row.comments,
            )
        )

    match_events_repo.replace_match_events_for_match(db, match_id, rows)
    cache_service.invalidate_cache(db, f"match_events:{match_id}")
