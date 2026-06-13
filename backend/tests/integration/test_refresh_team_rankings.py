from datetime import date

import pytest

from app.models.match import Match, StageType, StatusType
from app.models.standing import Standing
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam


@pytest.fixture
def seeded_tournament(db_session):
    tournament = Tournament(
        id=1,
        external_api_id=1,
        name="Test Cup",
        season="2026",
        start_date=date(2026, 6, 1),
        end_date=date(2026, 7, 15),
    )
    db_session.add(tournament)
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
                name="Chile",
                short_name="CHI",
                type="national",
                country="Chile",
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
            TournamentTeam(tournament_id=1, team_id=1, group="A"),
            TournamentTeam(tournament_id=1, team_id=2, group="A"),
            TournamentTeam(tournament_id=1, team_id=3, group="A"),
            TournamentTeam(tournament_id=1, team_id=4, group="A"),
            TournamentTeam(tournament_id=1, team_id=5, group="B"),
            TournamentTeam(tournament_id=1, team_id=6, group="B"),
            TournamentTeam(tournament_id=1, team_id=7, group="B"),
            TournamentTeam(tournament_id=1, team_id=8, group="B"),
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            Standing(
                tournament_id=1,
                team_id=1,
                group="A",
                position=1,
                points=9,
                wins=3,
                draws=0,
                losses=0,
                goals_for=6,
                goals_against=1,
            ),
            Standing(
                tournament_id=1,
                team_id=2,
                group="A",
                position=2,
                points=6,
                wins=2,
                draws=0,
                losses=1,
                goals_for=4,
                goals_against=2,
            ),
            Standing(
                tournament_id=1,
                team_id=3,
                group="A",
                position=3,
                points=3,
                wins=1,
                draws=0,
                losses=2,
                goals_for=2,
                goals_against=4,
            ),
            Standing(
                tournament_id=1,
                team_id=4,
                group="A",
                position=4,
                points=0,
                wins=0,
                draws=0,
                losses=3,
                goals_for=1,
                goals_against=6,
            ),
            Standing(
                tournament_id=1,
                team_id=5,
                group="B",
                position=1,
                points=9,
                wins=3,
                draws=0,
                losses=0,
                goals_for=7,
                goals_against=0,
            ),
            Standing(
                tournament_id=1,
                team_id=6,
                group="B",
                position=2,
                points=6,
                wins=2,
                draws=0,
                losses=1,
                goals_for=3,
                goals_against=2,
            ),
            Standing(
                tournament_id=1,
                team_id=7,
                group="B",
                position=3,
                points=3,
                wins=1,
                draws=0,
                losses=2,
                goals_for=2,
                goals_against=5,
            ),
            Standing(
                tournament_id=1,
                team_id=8,
                group="B",
                position=4,
                points=0,
                wins=0,
                draws=0,
                losses=3,
                goals_for=0,
                goals_against=7,
            ),
        ]
    )
    db_session.commit()

    return tournament


def seed_matches(db_session, matches: list[dict]) -> None:
    db_session.add_all([Match(**match) for match in matches])
    db_session.flush()


def qf_matches(status: StatusType = StatusType.FINISHED) -> list[dict]:
    return [
        dict(
            id=1,
            external_api_id=1,
            tournament_id=1,
            team_a_id=1,
            team_b_id=8,
            stage=StageType.QUARTER_FINAL,
            status=StatusType.FINISHED,
            kickoff_time=date(2026, 6, 10),
            team_a_score=2,
            team_b_score=0,
        ),
        dict(
            id=2,
            external_api_id=2,
            tournament_id=1,
            team_a_id=5,
            team_b_id=4,
            stage=StageType.QUARTER_FINAL,
            status=status,
            kickoff_time=date(2026, 6, 11),
            team_a_score=1 if status == StatusType.FINISHED else None,
            team_b_score=0 if status == StatusType.FINISHED else None,
        ),
        dict(
            id=3,
            external_api_id=3,
            tournament_id=1,
            team_a_id=2,
            team_b_id=7,
            stage=StageType.QUARTER_FINAL,
            status=status,
            kickoff_time=date(2026, 6, 11),
            team_a_score=3 if status == StatusType.FINISHED else None,
            team_b_score=1 if status == StatusType.FINISHED else None,
        ),
        dict(
            id=4,
            external_api_id=4,
            tournament_id=1,
            team_a_id=6,
            team_b_id=3,
            stage=StageType.QUARTER_FINAL,
            status=status,
            kickoff_time=date(2026, 6, 11),
            team_a_score=2 if status == StatusType.FINISHED else None,
            team_b_score=1 if status == StatusType.FINISHED else None,
        ),
    ]


def complete_tournament_matches() -> list[dict]:
    return qf_matches() + [
        dict(
            id=5,
            external_api_id=5,
            tournament_id=1,
            team_a_id=1,
            team_b_id=2,
            stage=StageType.SEMI_FINAL,
            status=StatusType.FINISHED,
            kickoff_time=date(2026, 7, 1),
            team_a_score=1,
            team_b_score=0,
        ),
        dict(
            id=6,
            external_api_id=6,
            tournament_id=1,
            team_a_id=5,
            team_b_id=6,
            stage=StageType.SEMI_FINAL,
            status=StatusType.FINISHED,
            kickoff_time=date(2026, 7, 1),
            team_a_score=2,
            team_b_score=1,
        ),
        dict(
            id=7,
            external_api_id=7,
            tournament_id=1,
            team_a_id=2,
            team_b_id=6,
            stage=StageType.THIRD_PLACE,
            status=StatusType.FINISHED,
            kickoff_time=date(2026, 7, 13),
            team_a_score=1,
            team_b_score=0,
        ),
        dict(
            id=8,
            external_api_id=8,
            tournament_id=1,
            team_a_id=1,
            team_b_id=5,
            stage=StageType.FINAL,
            status=StatusType.FINISHED,
            kickoff_time=date(2026, 7, 15),
            team_a_score=2,
            team_b_score=1,
        ),
    ]


def get_tournament_teams_by_team_id(db_session) -> dict[int, TournamentTeam]:
    rows = db_session.query(TournamentTeam).where(TournamentTeam.tournament_id == 1).all()
    return {row.team_id: row for row in rows}


def test_group_stage_no_knockout_matches_returns_empty(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    assert derive_team_rankings(db_session, 1) == []


def test_group_stage_only_group_matches_returns_empty(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(
        db_session,
        [
            dict(
                id=1,
                external_api_id=1,
                tournament_id=1,
                team_a_id=1,
                team_b_id=2,
                stage=StageType.GROUP,
                status=StatusType.FINISHED,
                kickoff_time=date(2026, 6, 5),
                team_a_score=1,
                team_b_score=0,
            ),
        ],
    )

    assert derive_team_rankings(db_session, 1) == []


def test_knockout_rows_team_relationships_load_without_error(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(db_session, qf_matches())

    rows = derive_team_rankings(db_session, 1)

    assert {row.team_id for row in rows} == {1, 2, 3, 4, 5, 6, 7, 8}


def test_qf_partial_no_ranks_assigned(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(db_session, qf_matches(status=StatusType.SCHEDULED))

    rows = derive_team_rankings(db_session, 1)

    assert all(row.final_rank is None for row in rows)


def test_qf_partial_all_teams_present(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(db_session, qf_matches(status=StatusType.SCHEDULED))

    rows = derive_team_rankings(db_session, 1)

    assert {row.team_id for row in rows} == {1, 2, 3, 4, 5, 6, 7, 8}


def test_qf_all_done_losers_ranked_winners_active(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(db_session, qf_matches())

    rows = derive_team_rankings(db_session, 1)
    by_team = {row.team_id: row for row in rows}

    for team_id in [1, 2, 5, 6]:
        assert by_team[team_id].final_rank is None
        assert by_team[team_id].stage_reached == StageType.QUARTER_FINAL

    for team_id in [3, 4, 7, 8]:
        assert by_team[team_id].final_rank is not None
        assert by_team[team_id].stage_reached == StageType.QUARTER_FINAL


def test_complete_tournament_correct_placements(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(db_session, complete_tournament_matches())

    rows = derive_team_rankings(db_session, 1)
    by_team = {row.team_id: row for row in rows}

    assert by_team[1].final_rank == 1
    assert by_team[5].final_rank == 2
    assert by_team[2].final_rank == 3
    assert by_team[6].final_rank == 4
    assert all(row.final_rank is not None for row in rows)


def test_complete_tournament_ranks_contiguous(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import derive_team_rankings

    seed_matches(db_session, complete_tournament_matches())

    rows = derive_team_rankings(db_session, 1)
    final_ranks = sorted(row.final_rank for row in rows if row.final_rank is not None)

    assert final_ranks == list(range(1, len(final_ranks) + 1))


def test_refresh_team_rankings_group_stage_marks_tournaments_skipped(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import refresh_team_rankings

    result = refresh_team_rankings(db_session)
    by_team = get_tournament_teams_by_team_id(db_session)

    assert result["tournaments_skipped"] == 1
    assert result["tournaments_refreshed"] == 0
    assert all(row.final_rank is None for row in by_team.values())
    assert all(row.stage_reached is None for row in by_team.values())


def test_refresh_team_rankings_knockout_updates_tournament_team_rows(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import refresh_team_rankings

    seed_matches(db_session, qf_matches())

    result = refresh_team_rankings(db_session)
    by_team = get_tournament_teams_by_team_id(db_session)

    assert result["tournaments_refreshed"] == 1
    assert result["tournaments_skipped"] == 0
    assert set(by_team) == {1, 2, 3, 4, 5, 6, 7, 8}

    for team_id in [1, 2, 5, 6]:
        assert by_team[team_id].final_rank is None
        assert by_team[team_id].stage_reached == StageType.QUARTER_FINAL

    for team_id in [3, 4, 7, 8]:
        assert by_team[team_id].final_rank is not None
        assert by_team[team_id].stage_reached == StageType.QUARTER_FINAL


def test_refresh_team_rankings_job_created_and_completed(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import refresh_team_rankings
    from app.models.refresh_job import RefreshJob

    refresh_team_rankings(db_session)

    job = db_session.query(RefreshJob).first()

    assert job is not None
    assert job.finished_at is not None


def test_refresh_team_rankings_returns_summary_shape(db_session, seeded_tournament):
    from app.api.v1.services.refresh_team_rankings import refresh_team_rankings

    result = refresh_team_rankings(db_session)

    assert "tournaments_refreshed" in result
    assert "tournaments_skipped" in result
    assert "tournaments_checked" in result
    assert result["tournaments_checked"] == 1
