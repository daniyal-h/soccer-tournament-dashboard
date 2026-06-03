from sqlalchemy.orm import Session, joinedload

from app.models.match_event import MatchEvent


def get_all_match_events(db: Session, match_id: int) -> list[MatchEvent]:
    # return all events ordered ascending chronologically
    return (
        db.query(MatchEvent)
        .options(
            joinedload(MatchEvent.team),
            joinedload(MatchEvent.player),
            joinedload(MatchEvent.secondary_player),
        )
        .where(MatchEvent.match_id == match_id)
        .order_by(
            MatchEvent.minute.asc(),
            MatchEvent.extra_minute.asc(),
            MatchEvent.id.asc(),
        )
        .all()
    )
