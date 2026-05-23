from sqlalchemy.orm import Session

from app.models.tournament import Tournament


def get_all_tournaments(db: Session) -> list[Tournament]:
    return db.query(Tournament).order_by(Tournament.start_date.desc()).all()


def get_tournament(db: Session, tournament_id: int) -> Tournament:
    return db.query(Tournament).where(Tournament.id == tournament_id).first()
