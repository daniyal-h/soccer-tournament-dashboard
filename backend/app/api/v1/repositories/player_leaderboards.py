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
