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
