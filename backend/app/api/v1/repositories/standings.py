from sqlalchemy.orm import Session

from app.models.standing import Standing
from app.schemas.standings import StandingRefreshRow


# return all rows for a given tournament, sorted by groups and position
def get_all_standings(db: Session, tournament_id: int) -> list[Standing]:
    return (
        db.query(Standing)
        .where(Standing.tournament_id == tournament_id)
        .order_by(Standing.group.asc(), Standing.position.asc())
        .all()
    )


def update_standings_in_tournament(
    db: Session, tournament_id: int, data: list[StandingRefreshRow]
) -> None:
    # delete old rows
    db.query(Standing).where(Standing.tournament_id == tournament_id).delete()

    # insert new rows
    db.add_all(data)
    db.commit()
