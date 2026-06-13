from datetime import date

import pytest

from app.api.v1.services import tournament_teams as tournament_teams_service
from app.models.match import StageType
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam
from app.schemas.errors import NotFoundError


@pytest.fixture
def seeded_tournament_teams(db_session):
    db_session.add_all(
        [
            Tournament(
                id=1,
                external_api_id=1,
                name="Test Cup",
                season="2026",
                start_date=date(2026, 6, 1),
                end_date=date(2026, 7, 15),
            ),
            Tournament(
                id=2,
                external_api_id=2,
                name="Other Cup",
                season="2026",
                start_date=date(2026, 8, 1),
                end_date=date(2026, 8, 31),
            ),
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            Team(
                id=1,
                external_api_id=101,
                name="Argentina",
                short_name="ARG",
                type="national",
                country="Argentina",
            ),
            Team(
                id=2,
                external_api_id=102,
                name="Brazil",
                short_name="BRA",
                type="national",
                country="Brazil",
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
            Team(
                id=7,
                external_api_id=107,
                name="Germany",
                short_name="GER",
                type="national",
                country="Germany",
            ),
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            # Active knockout teams: should come first, sorted by stage depth then name.
            TournamentTeam(
                tournament_id=1,
                team_id=5,
                group="B",
                final_rank=None,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=4,
                group="B",
                final_rank=None,
                stage_reached=StageType.FINAL,
            ),
            # Finalized teams: should come after active teams, sorted by final_rank.
            TournamentTeam(
                tournament_id=1,
                team_id=2,
                group="A",
                final_rank=2,
                stage_reached=StageType.FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=1,
                group="A",
                final_rank=1,
                stage_reached=StageType.FINAL,
            ),
            # Unranked teams: should come last, sorted by team name.
            TournamentTeam(
                tournament_id=1,
                team_id=7,
                group="C",
                final_rank=None,
                stage_reached=None,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=3,
                group="C",
                final_rank=None,
                stage_reached=None,
            ),
            # Different tournament: must not leak into tournament 1 results.
            TournamentTeam(
                tournament_id=2,
                team_id=6,
                group="A",
                final_rank=1,
                stage_reached=StageType.FINAL,
            ),
        ]
    )
    db_session.commit()


def test_get_ranked_tournament_teams_sorts_active_ranked_and_unranked_rows(
    db_session,
    seeded_tournament_teams,
):
    rows = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    assert [row.team.name for row in rows] == [
        "Denmark",
        "England",
        "Argentina",
        "Brazil",
        "Canada",
        "Germany",
    ]

    assert [(row.final_rank, row.stage_reached) for row in rows] == [
        (None, StageType.FINAL),
        (None, StageType.QUARTER_FINAL),
        (1, StageType.FINAL),
        (2, StageType.FINAL),
        (None, None),
        (None, None),
    ]

    assert {row.tournament_id for row in rows} == {1}


def test_get_ranked_tournament_teams_tie_breaks_active_stage_by_team_name(db_session):
    db_session.add(
        Tournament(
            id=1,
            external_api_id=1,
            name="Test Cup",
            season="2026",
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 15),
        )
    )
    db_session.flush()

    db_session.add_all(
        [
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
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            TournamentTeam(
                tournament_id=1,
                team_id=1,
                group="A",
                final_rank=None,
                stage_reached=StageType.SEMI_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=2,
                group="A",
                final_rank=None,
                stage_reached=StageType.SEMI_FINAL,
            ),
        ]
    )
    db_session.commit()

    rows = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    assert [row.team.name for row in rows] == ["Argentina", "Brazil"]


def test_get_ranked_tournament_teams_tie_breaks_equal_final_ranks_by_team_name(db_session):
    db_session.add(
        Tournament(
            id=1,
            external_api_id=1,
            name="Test Cup",
            season="2026",
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 15),
        )
    )
    db_session.flush()

    db_session.add_all(
        [
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
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            TournamentTeam(
                tournament_id=1,
                team_id=1,
                group="A",
                final_rank=3,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=2,
                group="A",
                final_rank=3,
                stage_reached=StageType.QUARTER_FINAL,
            ),
        ]
    )
    db_session.commit()

    rows = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    assert [row.team.name for row in rows] == ["Argentina", "Brazil"]


def test_get_ranked_tournament_teams_tie_breaks_unranked_rows_by_team_name(db_session):
    db_session.add(
        Tournament(
            id=1,
            external_api_id=1,
            name="Test Cup",
            season="2026",
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 15),
        )
    )
    db_session.flush()

    db_session.add_all(
        [
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
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            TournamentTeam(
                tournament_id=1,
                team_id=1,
                group="A",
                final_rank=None,
                stage_reached=None,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=2,
                group="A",
                final_rank=None,
                stage_reached=None,
            ),
        ]
    )
    db_session.commit()

    rows = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    assert [row.team.name for row in rows] == ["Argentina", "Brazil"]


def test_get_ranked_tournament_teams_raises_not_found_for_existing_tournament_with_no_teams(
    db_session,
):
    db_session.add(
        Tournament(
            id=1,
            external_api_id=1,
            name="Empty Cup",
            season="2026",
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 15),
        )
    )
    db_session.commit()

    with pytest.raises(NotFoundError, match="No teams found in tournament 1"):
        tournament_teams_service.get_ranked_tournament_teams(
            db_session,
            tournament_id=1,
        )


def test_get_ranked_tournament_teams_uses_cached_rows_on_second_call(
    db_session,
    seeded_tournament_teams,
):
    first_result = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    first_names = [row.team.name for row in first_result]

    # If the second call returns the same order after rows are changed,
    # it proves the service returned the cached payload instead of querying again.
    germany = (
        db_session.query(TournamentTeam)
        .where(TournamentTeam.tournament_id == 1)
        .where(TournamentTeam.team_id == 7)
        .one()
    )
    germany.final_rank = 1
    germany.stage_reached = StageType.FINAL
    db_session.commit()

    second_result = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    second_names = [
        row["team"]["name"] if isinstance(row, dict) else row.team.name for row in second_result
    ]

    assert first_names == [
        "Denmark",
        "England",
        "Argentina",
        "Brazil",
        "Canada",
        "Germany",
    ]
    assert second_names == first_names


def test_get_ranked_tournament_teams_mid_knockout_sorts_active_eliminated_then_unranked(
    db_session,
):
    db_session.add(
        Tournament(
            id=1,
            external_api_id=1,
            name="Test Cup",
            season="2026",
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 15),
        )
    )
    db_session.flush()

    db_session.add_all(
        [
            Team(
                id=1,
                external_api_id=101,
                name="Argentina",
                short_name="ARG",
                type="national",
                country="Argentina",
            ),
            Team(
                id=2,
                external_api_id=102,
                name="Brazil",
                short_name="BRA",
                type="national",
                country="Brazil",
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
            Team(
                id=7,
                external_api_id=107,
                name="Germany",
                short_name="GER",
                type="national",
                country="Germany",
            ),
            Team(
                id=8,
                external_api_id=108,
                name="Hungary",
                short_name="HUN",
                type="national",
                country="Hungary",
            ),
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            # Alive semi-finalists: active bucket, sorted by stage depth then name.
            TournamentTeam(
                tournament_id=1,
                team_id=2,
                group="A",
                final_rank=None,
                stage_reached=StageType.SEMI_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=1,
                group="A",
                final_rank=None,
                stage_reached=StageType.SEMI_FINAL,
            ),
            # QF eliminated teams: finalized bucket, sorted by final_rank.
            TournamentTeam(
                tournament_id=1,
                team_id=6,
                group="B",
                final_rank=5,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=5,
                group="B",
                final_rank=6,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            # Group-stage exits during incomplete tournament:
            # no final_rank yet, so service sorts by team name.
            TournamentTeam(
                tournament_id=1,
                team_id=8,
                group="C",
                final_rank=None,
                stage_reached=None,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=3,
                group="C",
                final_rank=None,
                stage_reached=None,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=4,
                group="D",
                final_rank=None,
                stage_reached=None,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=7,
                group="D",
                final_rank=None,
                stage_reached=None,
            ),
        ]
    )
    db_session.commit()

    rows = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    assert [row.team.name for row in rows] == [
        "Argentina",
        "Brazil",
        "France",
        "England",
        "Canada",
        "Denmark",
        "Germany",
        "Hungary",
    ]

    assert [(row.final_rank, row.stage_reached) for row in rows] == [
        (None, StageType.SEMI_FINAL),
        (None, StageType.SEMI_FINAL),
        (5, StageType.QUARTER_FINAL),
        (6, StageType.QUARTER_FINAL),
        (None, None),
        (None, None),
        (None, None),
        (None, None),
    ]


def test_get_ranked_tournament_teams_completed_tournament_sorts_all_by_final_rank(
    db_session,
):
    db_session.add(
        Tournament(
            id=1,
            external_api_id=1,
            name="Test Cup",
            season="2026",
            start_date=date(2026, 6, 1),
            end_date=date(2026, 7, 15),
        )
    )
    db_session.flush()

    db_session.add_all(
        [
            Team(
                id=1,
                external_api_id=101,
                name="Argentina",
                short_name="ARG",
                type="national",
                country="Argentina",
            ),
            Team(
                id=2,
                external_api_id=102,
                name="Brazil",
                short_name="BRA",
                type="national",
                country="Brazil",
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
    )
    db_session.flush()

    db_session.add_all(
        [
            TournamentTeam(
                tournament_id=1, team_id=2, group="A", final_rank=2, stage_reached=StageType.FINAL
            ),
            TournamentTeam(
                tournament_id=1, team_id=1, group="A", final_rank=1, stage_reached=StageType.FINAL
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=6,
                group="B",
                final_rank=5,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            TournamentTeam(
                tournament_id=1,
                team_id=5,
                group="B",
                final_rank=6,
                stage_reached=StageType.QUARTER_FINAL,
            ),
            TournamentTeam(
                tournament_id=1, team_id=4, group="C", final_rank=9, stage_reached=StageType.GROUP
            ),
            TournamentTeam(
                tournament_id=1, team_id=3, group="C", final_rank=10, stage_reached=StageType.GROUP
            ),
        ]
    )
    db_session.commit()

    rows = tournament_teams_service.get_ranked_tournament_teams(
        db_session,
        tournament_id=1,
    )

    assert [row.team.name for row in rows] == [
        "Argentina",
        "Brazil",
        "France",
        "England",
        "Denmark",
        "Canada",
    ]

    assert [row.final_rank for row in rows] == [1, 2, 5, 6, 9, 10]
