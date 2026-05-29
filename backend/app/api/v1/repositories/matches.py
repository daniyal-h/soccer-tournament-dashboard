from sqlalchemy.orm import Session

from app.models.match import Match


def get_matches_by_tournament(db: Session, tournament_id: int) -> list[Match]:
    return (
        db.query(Match)
        .where(Match.tournament_id == tournament_id)
        .order_by(Match.kickoff_time.asc())
        .all()
    )
