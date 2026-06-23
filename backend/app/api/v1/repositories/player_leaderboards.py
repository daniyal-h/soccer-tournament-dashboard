from sqlalchemy.orm import Session

from app.models.enums import LeaderboardType
from app.models.player_leaderboards import PlayerLeaderboard


def get_tournament_leaderboard_by_category(
    db: Session, tournament_id: int, category: LeaderboardType
) -> list[PlayerLeaderboard]:
    return (
        db.query(PlayerLeaderboard)
        .where(
            PlayerLeaderboard.tournament_id == tournament_id, PlayerLeaderboard.category == category
        )
        .order_by(PlayerLeaderboard.rank.asc())
        .limit(20)
        .all()
    )


# entirely replace all leaderboards in the given tournament with new ones
def replace_player_leaderboards_in_tournament(
    db: Session,
    tournament_id: int,
    rows: list[PlayerLeaderboard],
) -> None:
    db.query(PlayerLeaderboard).filter(
        PlayerLeaderboard.tournament_id == tournament_id,
    ).delete(synchronize_session=False)

    db.add_all(rows)

    db.commit()
