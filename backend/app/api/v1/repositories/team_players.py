from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.team_player import TeamPlayer


# return all players in team for a given tournament, ordered by position
def get_team_squad_by_tournament(db: Session, tournament_id: int, team_id: int) -> list[TeamPlayer]:
    return (
        db.query(TeamPlayer)
        .where(TeamPlayer.tournament_id == tournament_id, TeamPlayer.team_id == team_id)
        .order_by(
            TeamPlayer.position.asc().nulls_last(),
            TeamPlayer.squad_number.asc().nulls_last(),
            TeamPlayer.player_id.asc(),
        )
        .all()
    )


def upsert_team_players(db: Session, rows: list[TeamPlayer]) -> None:
    """
    Upsert team-players rather than delete-and-add.
    Do not overwrite IDs and timestamps manually.
    """
    if not rows:
        return

    values = [
        {
            "tournament_id": row.tournament_id,
            "team_id": row.team_id,
            "player_id": row.player_id,
            "squad_number": row.squad_number,
            "position": row.position,
        }
        for row in rows
    ]

    stmt = insert(TeamPlayer).values(values)

    update_columns = {
        "squad_number": stmt.excluded.squad_number,
        "position": stmt.excluded.position,
    }

    stmt = stmt.on_conflict_do_update(
        index_elements=["tournament_id", "team_id", "player_id"],
        set_=update_columns,
    )

    db.execute(stmt)
    db.commit()
