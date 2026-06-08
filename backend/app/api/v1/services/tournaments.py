from datetime import date

from sqlalchemy.orm import Session

from app.api.v1.repositories import tournaments as tournaments_repo
from app.models.tournament import Tournament
from app.schemas.errors import NotFoundError


def get_tournaments(db: Session) -> list[Tournament]:
    tournaments = tournaments_repo.get_all_tournaments(db)

    if not tournaments:
        raise NotFoundError("No tournaments found")

    return tournaments


def get_tournament(db: Session, tournament_id: int) -> Tournament:
    tournament = tournaments_repo.get_tournament_by_id(db, tournament_id)

    if not tournament:
        raise NotFoundError(f"Tournament {tournament_id} was not found")

    return tournament


# return all tournaments which will need refreshing within the margin
def get_refreshable_tournaments(db: Session, margin_days: int) -> list[Tournament]:
    today = date.today()

    return tournaments_repo.get_refreshable_tournaments(db, today=today, margin_days=margin_days)
