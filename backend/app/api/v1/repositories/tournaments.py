from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models.tournament import Tournament


def get_all_tournaments(db: Session) -> list[Tournament]:
    return db.query(Tournament).order_by(Tournament.start_date.desc()).all()


def get_tournament_by_id(db: Session, tournament_id: int) -> Tournament:
    return db.query(Tournament).where(Tournament.id == tournament_id).first()


def get_refreshable_tournaments(
    db: Session,
    today: date,
    margin_days: int,
) -> list[Tournament]:
    return (
        db.query(Tournament)
        .where(Tournament.start_date <= today + timedelta(days=margin_days))  # today within margin
        .where(Tournament.end_date >= today)  # hasn't ended yet
        .all()
    )
