from sqlalchemy.orm import Session

from app.models.tournament import Tournament


async def get_all_tournaments(db: Session) -> list[Tournament]:
    return db.query(Tournament).order_by(Tournament.start_date.desc()).all()
