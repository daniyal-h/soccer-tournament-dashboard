from sqlalchemy.orm import Session

from app.api.v1.repositories import matches as matches_repo
from app.models.match import Match
from app.schemas.errors import NotFoundError


def get_matches(db: Session, tournament_id: int) -> list[Match]:
    matches = matches_repo.get_all_matches_by_tournament(db, tournament_id)

    if not matches:
        raise NotFoundError(f"No matches found in tournament {tournament_id}")
    
    return matches
