from sqlalchemy.orm import Session

from app.api.v1.repositories import players as players_repo


def get_optional_player_id_from_external_id(db: Session, external_api_id: int) -> int | None:
    return players_repo.get_player_from_external_id(db, external_api_id).id

