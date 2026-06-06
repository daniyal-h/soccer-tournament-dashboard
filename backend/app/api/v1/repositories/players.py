from sqlalchemy.orm import Session

from app.models.players import Player


def get_player_from_external_id(db: Session, external_api_id: int) -> Player | None:
    return db.query(Player).where(Player.external_api_id == external_api_id).first()
