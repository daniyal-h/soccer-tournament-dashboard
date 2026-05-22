from sqlalchemy.orm import Session

from app.api.v1.repositories import teams as teams_repo
from app.schemas.errors import NotFoundError


def get_team_id_from_external_id(db: Session, external_api_id: int) -> int:
    team = teams_repo.get_team_from_external_id(db, external_api_id)

    if not team:
        raise NotFoundError(f"Team with external id {external_api_id} not found")

    return team.id
