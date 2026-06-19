from sqlalchemy.orm import Session

from app.api.v1.repositories import players as players_repo
from app.schemas.errors import NotFoundError


def get_player_id_from_external_id(db: Session, external_api_id: int) -> int:
    player = players_repo.get_player_from_external_id(db, external_api_id)

    if not player:
        raise NotFoundError(f"Player with external id {external_api_id} not found")

    return player.id


def get_optional_player_id_from_external_id(db: Session, external_api_id: int | None) -> int | None:
    if external_api_id is None:
        return None

    player = players_repo.get_player_from_external_id(db, external_api_id)

    if not player:
        return None

    return player.id
