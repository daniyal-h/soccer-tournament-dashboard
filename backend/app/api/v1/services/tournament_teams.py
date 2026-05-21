from sqlalchemy.orm import Session

from app.api.v1.repositories import tournament_teams as tournament_teams_repo
from app.schemas.errors import NotFoundError


def get_tournament_teams(db: Session, tournament_id: int):
    tournament_teams = tournament_teams_repo.get_teams_in_tournament(db, tournament_id)

    if not tournament_teams:
        raise NotFoundError("No teams found in tournament")

    return tournament_teams
