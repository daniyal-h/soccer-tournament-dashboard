from sqlalchemy.orm import Session

from app.models.team import Team


def get_team_from_external_id(db: Session, external_api_id: int) -> Team:
    return db.query(Team).where(Team.external_api_id == external_api_id).first()