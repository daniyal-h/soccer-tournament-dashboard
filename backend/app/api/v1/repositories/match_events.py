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


# entirely replace all events in the given match with new ones
def replace_match_events_for_match(db: Session, match_id: int, rows: list[MatchEvent]) -> None:
    db.query(MatchEvent).where(MatchEvent.match_id == match_id).delete(
        synchronize_session=False,
    )

    db.add_all(rows)
    db.commit()
