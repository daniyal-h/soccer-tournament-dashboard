from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.models.match import Match


def get_matches_by_tournament(db: Session, tournament_id: int) -> list[Match]:
    return (
        db.query(Match)
        .where(Match.tournament_id == tournament_id)
        .order_by(Match.kickoff_time.asc())
        .all()
    )


def upsert_matches_in_tournament(
    db: Session,
    tournament_id: int,
    rows: list[Match],
) -> None:
    """
    Upsert matches into tournaments rather than delete-and-add.
    Match Event tables is related to matches, so preserve the entry.
    Update existing rows, or add new ones.
    """
    if not rows:
        return

    values = [
        {
            "external_api_id": row.external_api_id,
            "tournament_id": tournament_id,
            "team_a_id": row.team_a_id,
            "team_b_id": row.team_b_id,
            "kickoff_time": row.kickoff_time,
            "stage": row.stage,
            "group": row.group,
            "status": row.status,
            "venue": row.venue,
            "city": row.city,
            "elapsed": row.elapsed,
            "team_a_score": row.team_a_score,
            "team_b_score": row.team_b_score,
            "team_a_penalties": row.team_a_penalties,
            "team_b_penalties": row.team_b_penalties,
        }
        for row in rows
    ]

    stmt = insert(Match).values(values)

    # do not update id, external_api_id, created_at or updated_at manually
    update_columns = {
        "tournament_id": stmt.excluded.tournament_id,
        "team_a_id": stmt.excluded.team_a_id,
        "team_b_id": stmt.excluded.team_b_id,
        "kickoff_time": stmt.excluded.kickoff_time,
        "stage": stmt.excluded.stage,
        "group": stmt.excluded.group,
        "status": stmt.excluded.status,
        "venue": stmt.excluded.venue,
        "city": stmt.excluded.city,
        "elapsed": stmt.excluded.elapsed,
        "team_a_score": stmt.excluded.team_a_score,
        "team_b_score": stmt.excluded.team_b_score,
        "team_a_penalties": stmt.excluded.team_a_penalties,
        "team_b_penalties": stmt.excluded.team_b_penalties,
    }

    stmt = stmt.on_conflict_do_update(
        index_elements=["external_api_id"],
        set_=update_columns,
    )

    db.execute(stmt)
    db.commit()
