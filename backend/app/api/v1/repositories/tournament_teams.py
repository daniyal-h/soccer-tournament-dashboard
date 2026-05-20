from sqlalchemy.orm import Session

from app.models.tournament_team import TournamentTeam


def get_teams_in_tournament(db: Session, tournament_id: int):
    return db.query(TournamentTeam).where(TournamentTeam.tournament_id == tournament_id).all()
