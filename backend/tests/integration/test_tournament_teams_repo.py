from datetime import date

import pytest

from app.api.v1.repositories import tournament_teams as tournament_teams_repo
from app.models.enums import StageType
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam
from app.schemas.tournament_teams import TeamRankingRefreshRow


@pytest.fixture
def seeded_tournament_teams(db_session):
    tournament = Tournament(
        id=1,
        external_api_id=1,
        name="Test Cup",
        season="2026",
        start_date=date(2026, 6, 1),
        end_date=date(2026, 7, 15),
    )

    other_tournament = Tournament(
        id=2,
        external_api_id=2,
        name="Other Cup",
        season="2026",
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 31),
    )

    db_session.add_all([tournament, other_tournament])
    db_session.flush()

    teams = [
        Team(
            id=1,
            external_api_id=101,
            name="Brazil",
            short_name="BRA",
            type="national",
            country="Brazil",
        ),
        Team(
            id=2,
            external_api_id=102,
            name="Argentina",
            short_name="ARG",
            type="national",
            country="Argentina",
        ),
        Team(
            id=3,
            external_api_id=103,
            name="Canada",
            short_name="CAN",
            type="national",
            country="Canada",
        ),
        Team(
            id=4,
            external_api_id=104,
            name="Denmark",
            short_name="DEN",
            type="national",
            country="Denmark",
        ),
        Team(
            id=5,
            external_api_id=105,
            name="England",
            short_name="ENG",
            type="national",
            country="England",
        ),
        Team(
            id=6,
            external_api_id=106,
            name="France",
            short_name="FRA",
            type="national",
            country="France",
        ),
    ]

    db_session.add_all(teams)
    db_session.flush()

    db_session.add_all(
        [
            TournamentTeam(
                tournament_id=1, team_id=1, group="B", final_rank=2, stage_reached=StageType.FINAL
            ),
            TournamentTeam(
                tournament_id=1, team_id=2, group="A", final_rank=1, stage_reached=StageType.FINAL
            ),
            TournamentTeam(
                tournament_id=1, team_id=3, group="A", final_rank=None, stage_reached=None
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=4,
                group="B",
                final_rank=None,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=5,
                group=None,
                final_rank=3,
                stage_reached=StageType.SEMI_FINAL,
            ),
            TournamentTeam(
                tournament_id=2, team_id=6, group="A", final_rank=1, stage_reached=StageType.FINAL
            ),
        ]
    )

    db_session.commit()


def test_get_teams_in_tournament_filters_by_tournament_and_orders_by_group_then_team_name(
    db_session,
    seeded_tournament_teams,
):
    rows = tournament_teams_repo.get_teams_in_tournament(db_session, tournament_id=1)

    assert [row.team.name for row in rows] == [
        "Argentina",
        "Canada",
        "Brazil",
        "Denmark",
        "England",
    ]
    assert {row.tournament_id for row in rows} == {1}


def test_get_teams_in_tournament_loads_team_relationship(db_session, seeded_tournament_teams):
    rows = tournament_teams_repo.get_teams_in_tournament(db_session, tournament_id=1)

    assert rows[0].team.name == "Argentina"
    assert rows[0].team.short_name == "ARG"


def test_get_ranked_teams_in_tournament_filters_by_tournament_and_orders_by_rank_nulls_last(
    db_session,
    seeded_tournament_teams,
):
    rows = tournament_teams_repo.get_ranked_teams_in_tournament(db_session, tournament_id=1)

    assert [row.team.name for row in rows] == [
        "Argentina",
        "Brazil",
        "England",
        "Canada",
        "Denmark",
    ]
    assert [row.final_rank for row in rows] == [1, 2, 3, None, None]
    assert {row.tournament_id for row in rows} == {1}


def test_get_ranked_teams_in_tournament_tie_breaks_equal_ranks_by_team_name(
    db_session,
    seeded_tournament_teams,
):
    brazil = tournament_teams_repo.get_team_in_tournament(db_session, tournament_id=1, team_id=1)
    england = tournament_teams_repo.get_team_in_tournament(db_session, tournament_id=1, team_id=5)

    brazil.final_rank = 2
    england.final_rank = 2
    db_session.commit()

    rows = tournament_teams_repo.get_ranked_teams_in_tournament(db_session, tournament_id=1)

    assert [row.team.name for row in rows[:3]] == [
        "Argentina",
        "Brazil",
        "England",
    ]


def test_get_team_in_tournament_returns_matching_row(db_session, seeded_tournament_teams):
    row = tournament_teams_repo.get_team_in_tournament(
        db_session,
        tournament_id=1,
        team_id=2,
    )

    assert row is not None
    assert row.tournament_id == 1
    assert row.team_id == 2
    assert row.group == "A"


def test_get_team_in_tournament_returns_none_for_wrong_tournament(
    db_session, seeded_tournament_teams
):
    row = tournament_teams_repo.get_team_in_tournament(
        db_session,
        tournament_id=2,
        team_id=2,
    )

    assert row is None


def test_update_team_ranking_by_id_updates_only_matching_tournament_team(
    db_session,
    seeded_tournament_teams,
):
    row = TeamRankingRefreshRow(
        team_id=3,
        final_rank=4,
        stage_reached=StageType.QUARTER_FINAL,
    )

    tournament_teams_repo.update_team_ranking_by_id(db_session, tournament_id=1, row=row)
    db_session.commit()

    updated = tournament_teams_repo.get_team_in_tournament(
        db_session,
        tournament_id=1,
        team_id=3,
    )
    other_tournament_row = tournament_teams_repo.get_team_in_tournament(
        db_session,
        tournament_id=2,
        team_id=6,
    )

    assert updated.final_rank == 4
    assert updated.stage_reached == StageType.QUARTER_FINAL

    assert other_tournament_row.final_rank == 1
    assert other_tournament_row.stage_reached == StageType.FINAL
