from sqlalchemy import func
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.players import Player


def get_player_from_external_id(db: Session, external_api_id: int) -> Player | None:
    return db.query(Player).where(Player.external_api_id == external_api_id).first()


def upsert_players(db: Session, rows: list[Player]) -> None:
    """
    Upsert players rather than delete-and-add.
    Do not overwrite IDs and timestamps manually.
    """
    if not rows:
        return

    values = [
        {
            "external_api_id": row.external_api_id,
            "display_name": row.display_name,
            "first_name": row.first_name,
            "last_name": row.last_name,
            "date_of_birth": row.date_of_birth,
            "photo_url": row.photo_url,
            "nationality": row.nationality,
            "height": row.height,
        }
        for row in rows
    ]

    stmt = insert(Player).values(values)

    # coalesce if new data is weaker
    update_columns = {
        "display_name": stmt.excluded.display_name,
        "first_name": func.coalesce(stmt.excluded.first_name, Player.first_name),
        "last_name": func.coalesce(stmt.excluded.last_name, Player.last_name),
        "date_of_birth": func.coalesce(
            stmt.excluded.date_of_birth,
            Player.date_of_birth,
        ),
        "photo_url": func.coalesce(stmt.excluded.photo_url, Player.photo_url),
        "nationality": func.coalesce(stmt.excluded.nationality, Player.nationality),
        "height": func.coalesce(stmt.excluded.height, Player.height),
    }

    stmt = stmt.on_conflict_do_update(
        index_elements=["external_api_id"],
        set_=update_columns,
    )

    db.execute(stmt)
    db.commit()
