from sqlalchemy.orm import Session

from app.api.v1.repositories import tournament_teams as tournament_teams_repo
from app.schemas.errors import NotFoundError


def get_tournament_teams(db: Session, tournament_id: int):
    tournament_teams = tournament_teams_repo.get_teams_in_tournament(db, tournament_id)

    if not tournament_teams:
        raise NotFoundError(f"No teams found in tournament {tournament_id}")

    return tournament_teams


def get_team_group(db: Session, tournament_id: int, team_id: int) -> str | None:
    row = tournament_teams_repo.get_team_in_tournament(db, tournament_id, team_id)

    return row.group if row else None
