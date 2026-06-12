from datetime import UTC, date, datetime, timedelta

from app.api.v1.services import refresh_team_rankings as refresh_team_rankings_service
from app.models.match import Match, StageType, StatusType
from app.models.refresh_job import JobName, JobStatus, RefreshJob
from app.models.standing import Standing
from app.models.team import Team, TeamType
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam


def create_tournament() -> Tournament:
    today = date.today()

    return Tournament(
        external_api_id=1,
        name="World Cup",
        season="2026",
        logo_url=None,
        start_date=today - timedelta(days=1),
        end_date=today + timedelta(days=30),
    )


def create_team(external_api_id: int, name: str, short_name: str) -> Team:
    return Team(
        external_api_id=external_api_id,
        name=name,
        short_name=short_name,
        type=TeamType.NATIONAL,
        logo_url=None,
        country=name,
    )


def create_tournament_team(tournament_id: int, team_id: int, group: str) -> TournamentTeam:
    return TournamentTeam(
        tournament_id=tournament_id,
        team_id=team_id,
        group=group,
        final_rank=None,
        stage_reached=None,
    )


def create_standing(
    tournament_id: int,
    team_id: int,
    group: str,
    position: int,
    points: int,
    goals_for: int,
    goals_against: int,
) -> Standing:
    return Standing(
        tournament_id=tournament_id,
        team_id=team_id,
        group=group,
        position=position,
        points=points,
        wins=points // 3,
        draws=points % 3,
        losses=0,
        goals_for=goals_for,
        goals_against=goals_against,
    )


def create_match(
    external_api_id: int,
    tournament_id: int,
    team_a_id: int,
    team_b_id: int,
    stage: StageType,
    status: StatusType,
    team_a_score: int | None = None,
    team_b_score: int | None = None,
) -> Match:
    return Match(
        external_api_id=external_api_id,
        tournament_id=tournament_id,
        team_a_id=team_a_id,
        team_b_id=team_b_id,
        kickoff_time=datetime(2026, 7, 4, 15, 0, tzinfo=UTC),
        stage=stage,
        group=None if stage != StageType.GROUP else "A",
        status=status,
        venue=None,
        city=None,
        elapsed=None,
        team_a_score=team_a_score,
        team_b_score=team_b_score,
        team_a_penalties=None,
        team_b_penalties=None,
    )


def seed_base_tournament(db_session):
    tournament = create_tournament()

    teams = [
        create_team(1001, "Argentina", "ARG"),
        create_team(1002, "Brazil", "BRA"),
        create_team(1003, "Canada", "CAN"),
        create_team(1004, "France", "FRA"),
    ]

    db_session.add(tournament)
    db_session.add_all(teams)
    db_session.commit()

    tournament_teams = [
        create_tournament_team(tournament.id, teams[0].id, "A"),
        create_tournament_team(tournament.id, teams[1].id, "A"),
        create_tournament_team(tournament.id, teams[2].id, "B"),
        create_tournament_team(tournament.id, teams[3].id, "B"),
    ]

    standings = [
        create_standing(tournament.id, teams[0].id, "A", 1, 7, 5, 1),
        create_standing(tournament.id, teams[1].id, "A", 2, 6, 4, 2),
        create_standing(tournament.id, teams[2].id, "B", 1, 4, 3, 3),
        create_standing(tournament.id, teams[3].id, "B", 2, 3, 2, 4),
    ]

    db_session.add_all(tournament_teams)
    db_session.add_all(standings)
    db_session.commit()

    return tournament, teams


def test_derive_team_rankings_group_stage_returns_empty(db_session):
    tournament, teams = seed_base_tournament(db_session)

    db_session.add(
        create_match(
            external_api_id=1,
            tournament_id=tournament.id,
            team_a_id=teams[0].id,
            team_b_id=teams[1].id,
            stage=StageType.GROUP,
            status=StatusType.FINISHED,
            team_a_score=2,
            team_b_score=1,
        )
    )
    db_session.commit()

    rows = refresh_team_rankings_service.derive_team_rankings(
        db_session,
        tournament.id,
    )

    assert rows == []


def test_derive_team_rankings_knockout_active_returns_ranked_and_unranked_rows(db_session):
    tournament, teams = seed_base_tournament(db_session)

    db_session.add_all(
        [
            create_match(
                external_api_id=1,
                tournament_id=tournament.id,
                team_a_id=teams[0].id,
                team_b_id=teams[2].id,
                stage=StageType.QUARTER_FINAL,
                status=StatusType.FINISHED,
                team_a_score=2,
                team_b_score=0,
            ),
            create_match(
                external_api_id=2,
                tournament_id=tournament.id,
                team_a_id=teams[1].id,
                team_b_id=teams[3].id,
                stage=StageType.QUARTER_FINAL,
                status=StatusType.SCHEDULED,
            ),
        ]
    )
    db_session.commit()

    rows = refresh_team_rankings_service.derive_team_rankings(
        db_session,
        tournament.id,
    )

    rows_by_team_id = {row.team_id: row for row in rows}

    assert set(rows_by_team_id) == {team.id for team in teams}

    assert rows_by_team_id[teams[2].id].final_rank is None
    assert rows_by_team_id[teams[2].id].stage_reached is None

    assert rows_by_team_id[teams[0].id].final_rank is None
    assert rows_by_team_id[teams[0].id].stage_reached == StageType.QUARTER_FINAL

    assert rows_by_team_id[teams[1].id].final_rank is None
    assert rows_by_team_id[teams[1].id].stage_reached == StageType.QUARTER_FINAL

    assert rows_by_team_id[teams[3].id].final_rank is None
    assert rows_by_team_id[teams[3].id].stage_reached == StageType.QUARTER_FINAL


def test_refresh_team_rankings_end_to_end_updates_rows_and_records_success_job(
    db_session,
    mocker,
):
    tournament, teams = seed_base_tournament(db_session)

    db_session.add_all(
        [
            create_match(
                external_api_id=1,
                tournament_id=tournament.id,
                team_a_id=teams[0].id,
                team_b_id=teams[2].id,
                stage=StageType.SEMI_FINAL,
                status=StatusType.FINISHED,
                team_a_score=3,
                team_b_score=1,
            ),
            create_match(
                external_api_id=2,
                tournament_id=tournament.id,
                team_a_id=teams[1].id,
                team_b_id=teams[3].id,
                stage=StageType.SEMI_FINAL,
                status=StatusType.FINISHED,
                team_a_score=1,
                team_b_score=2,
            ),
            create_match(
                external_api_id=3,
                tournament_id=tournament.id,
                team_a_id=teams[0].id,
                team_b_id=teams[3].id,
                stage=StageType.FINAL,
                status=StatusType.FINISHED,
                team_a_score=2,
                team_b_score=1,
            ),
        ]
    )
    db_session.commit()

    result = refresh_team_rankings_service.refresh_team_rankings(db_session)

    assert result["message"] == "Team Rankings refresh completed"
    assert result["tournaments_checked"] == 1
    assert result["tournaments_refreshed"] == 1
    assert result["tournaments_skipped"] == 0
    assert result["rows_processed"] == 4
    assert result["failures"] == []

    tournament_teams = (
        db_session.query(TournamentTeam).filter(TournamentTeam.tournament_id == tournament.id).all()
    )

    rows_by_team_id = {row.team_id: row for row in tournament_teams}

    assert rows_by_team_id[teams[0].id].final_rank == 1
    assert rows_by_team_id[teams[0].id].stage_reached == StageType.FINAL

    assert rows_by_team_id[teams[3].id].final_rank == 2
    assert rows_by_team_id[teams[3].id].stage_reached == StageType.FINAL

    assert rows_by_team_id[teams[1].id].final_rank == 3
    assert rows_by_team_id[teams[1].id].stage_reached == StageType.SEMI_FINAL

    assert rows_by_team_id[teams[2].id].final_rank == 4
    assert rows_by_team_id[teams[2].id].stage_reached == StageType.SEMI_FINAL

    refresh_job = db_session.query(RefreshJob).one()

    assert refresh_job.job_name == JobName.TEAM_RANKINGS_REFRESH
    assert refresh_job.status == JobStatus.SUCCESS
