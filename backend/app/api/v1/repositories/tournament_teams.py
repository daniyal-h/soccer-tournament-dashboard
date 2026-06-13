from sqlalchemy import nulls_last
from sqlalchemy.orm import Session

from app.models.team import Team
from app.models.tournament_team import TournamentTeam
from app.schemas.tournament_teams import TeamRankingRefreshRow


# return teams in a tournament ordered by group and team name
def get_teams_in_tournament(db: Session, tournament_id: int) -> list[TournamentTeam]:
    return (
        db.query(TournamentTeam)
        .join(TournamentTeam.team)
        .where(TournamentTeam.tournament_id == tournament_id)
        .order_by(TournamentTeam.group.asc(), Team.name.asc())
        .all()
    )


# return ranked teams in a tournament, tie-break with name
def get_ranked_teams_in_tournament(db: Session, tournament_id: int) -> list[TournamentTeam]:
    return (
        db.query(TournamentTeam)
        .join(TournamentTeam.team)
        .where(TournamentTeam.tournament_id == tournament_id)
        .order_by(nulls_last(TournamentTeam.final_rank.asc()), Team.name.asc())
        .all()
    )


def get_team_in_tournament(db: Session, tournament_id: int, team_id: int) -> TournamentTeam | None:
    return (
        db.query(TournamentTeam)
        .where(TournamentTeam.tournament_id == tournament_id)
        .where(TournamentTeam.team_id == team_id)
        .first()
    )


def update_team_ranking_by_id(db: Session, tournament_id: int, row: TeamRankingRefreshRow) -> None:
    (
        db.query(TournamentTeam)
        .where(TournamentTeam.tournament_id == tournament_id, TournamentTeam.team_id == row.team_id)
        .update(
            {
                TournamentTeam.final_rank: row.final_rank,
                TournamentTeam.stage_reached: row.stage_reached,
            },
            synchronize_session=False,
        )
    )
