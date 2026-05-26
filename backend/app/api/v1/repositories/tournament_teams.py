from sqlalchemy.orm import Session

from app.models.tournament_team import TournamentTeam
from app.models.team import Team

# return teams in a tournament ordered by group and team name
def get_teams_in_tournament(db: Session, tournament_id: int) -> list[TournamentTeam]:
    return (
    db.query(TournamentTeam)
    .join(TournamentTeam.team)
    .where(TournamentTeam.tournament_id == tournament_id)
    .order_by(TournamentTeam.group.asc(), Team.name.asc())
    .all()
)