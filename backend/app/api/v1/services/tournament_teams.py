from sqlalchemy.orm import Session

from app.api.v1.repositories import tournament_teams as tournament_teams_repo
from app.api.v1.services import tournaments as tournaments_service
from app.constants.team_rankings import STAGE_SORT_ORDER
from app.models.tournament_team import TournamentTeam
from app.schemas.errors import NotFoundError
from app.schemas.tournament_teams import TeamRankingRefreshRow


def get_tournament_team_display_sort_key(row: TournamentTeam) -> tuple:
    # active knockout/progress teams
    if row.final_rank is None and row.stage_reached is not None:
        return (
            0,
            STAGE_SORT_ORDER.get(row.stage_reached, 99),
            row.team.name,
        )

    # finalized placed teams --> sort by final rank
    if row.final_rank is not None:
        return (
            1,
            row.final_rank,
            row.team.name,
        )

    # group-stage/pre-tournament/unranked teams --> sort by name
    return (
        2,
        row.team.name,
    )


def get_tournament_teams(db: Session, tournament_id: int) -> list[TournamentTeam]:
    tournament_teams = tournament_teams_repo.get_teams_in_tournament(db, tournament_id)

    if not tournament_teams:
        raise NotFoundError(f"No teams found in tournament {tournament_id}")

    return tournament_teams


def get_ranked_tournament_teams(db: Session, tournament_id: int) -> list[TournamentTeam]:
    tournaments_service.validate_tournament_exists(db, tournament_id)

    tournament_teams = tournament_teams_repo.get_teams_in_tournament(db, tournament_id)

    if not tournament_teams:
        raise NotFoundError(f"No teams found in tournament {tournament_id}")

    return sorted(tournament_teams, key=get_tournament_team_display_sort_key)


def get_team_group(db: Session, tournament_id: int, team_id: int) -> str | None:
    row = tournament_teams_repo.get_team_in_tournament(db, tournament_id, team_id)

    return row.group if row else None


def update_team_rankings(
    db: Session, tournament_id: int, data: list[TeamRankingRefreshRow]
) -> None:
    for row in data:
        tournament_teams_repo.update_team_ranking_by_id(db, tournament_id, row)
