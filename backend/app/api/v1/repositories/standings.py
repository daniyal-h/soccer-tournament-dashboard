from sqlalchemy.orm import Session

from app.models.standing import Standing


# return all rows for a given tournament, sorted by groups and position
def get_all_standings(db: Session, tournament_id: int) -> list[Standing]:
    return (
        db.query(Standing)
        .where(Standing.tournament_id == tournament_id)
        .order_by(Standing.group.asc(), Standing.position.asc())
        .all()
    )


def get_standings_for_team(db: Session, tournament_id: int, team_id: int) -> Standing | None:
    return (
        db.query(Standing)
        .where(Standing.tournament_id == tournament_id, Standing.team_id == team_id)
        .first()
    )


def update_standings_in_tournament(db: Session, tournament_id: int, rows: list[Standing]) -> None:
    # delete old rows
    db.query(Standing).where(Standing.tournament_id == tournament_id).delete()

    # insert new rows
    db.add_all(rows)
    db.commit()
