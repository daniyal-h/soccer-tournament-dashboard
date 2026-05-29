from sqlalchemy.orm import Session

from app.api.v1.repositories import matches as matches_repo
from app.api.v1.services import tournaments as tournaments_service
from app.models.match import Match


def get_matches(db: Session, tournament_id: int) -> list[Match]:
    """
    First check if the tournament exists.
    Return all matches, which may be an empty list (not an error).
    """
    tournaments_service.validate_tournament_exists(db, tournament_id)

    return matches_repo.get_all_matches_by_tournament(db, tournament_id)
