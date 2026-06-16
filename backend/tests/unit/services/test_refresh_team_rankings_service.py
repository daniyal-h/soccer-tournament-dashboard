from unittest.mock import MagicMock

import pytest

from app.api.v1.services.refresh_team_rankings import (
    all_matches_finished,
    assign_rank_bucket,
    build_standings_lookup,
    derive_team_rankings,
    get_knockout_match_context,
    get_match_winner_and_loser,
)
from app.models.enums import StatusType
from app.models.match import StageType
from app.models.standing import Standing
from app.models.team import Team

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture
def db():
    return MagicMock()


def make_standing(
    team_id, group="A", points=0, goals_for=0, goals_against=0, wins=0, draws=0, losses=0, name=None
):
    name = name or f"Team{team_id}"
    team = Team()
    team.id = team_id
    team.name = name

    standing = Standing()
    standing.team_id = team_id
    standing.group = group
    standing.points = points
    standing.wins = wins
    standing.draws = draws
    standing.losses = losses
    standing.goals_for = goals_for
    standing.goals_against = goals_against
    standing.team = team

    return standing


def make_match(
    id, a, b, stage, status=StatusType.FINISHED, a_score=None, b_score=None, a_pen=None, b_pen=None
):
    from app.models.match import Match

    match = Match()
    match.id = id
    match.team_a_id = a
    match.team_b_id = b
    match.stage = stage
    match.status = status
    match.team_a_score = a_score
    match.team_b_score = b_score
    match.team_a_penalties = a_pen
    match.team_b_penalties = b_pen

    return match


def ranks_of(rows):
    """Map team_id → final_rank for easy assertions."""
    return {r.team_id: r.final_rank for r in rows}


def stages_of(rows):
    """Map team_id → stage_reached for easy assertions."""
    return {r.team_id: r.stage_reached for r in rows}


def standings_8():
    return [
        make_standing(1, "A", points=9, goals_for=6, goals_against=1, wins=3, name="Argentina"),
        make_standing(
            2, "A", points=6, goals_for=4, goals_against=2, wins=2, losses=1, name="Brazil"
        ),
        make_standing(
            3, "A", points=3, goals_for=2, goals_against=4, wins=1, losses=2, name="Chile"
        ),
        make_standing(4, "A", points=0, goals_for=1, goals_against=6, losses=3, name="Denmark"),
        make_standing(5, "B", points=9, goals_for=7, goals_against=0, wins=3, name="England"),
        make_standing(
            6, "B", points=6, goals_for=3, goals_against=2, wins=2, losses=1, name="France"
        ),
        make_standing(
            7, "B", points=3, goals_for=2, goals_against=5, wins=1, losses=2, name="Germany"
        ),
        make_standing(8, "B", points=0, goals_for=0, goals_against=7, losses=3, name="Hungary"),
    ]


def qf_all_done():
    return [
        make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
        make_match(2, 5, 4, StageType.QUARTER_FINAL, a_score=1, b_score=0),
        make_match(3, 2, 7, StageType.QUARTER_FINAL, a_score=3, b_score=1),
        make_match(4, 6, 3, StageType.QUARTER_FINAL, a_score=2, b_score=1),
    ]


def sf_all_done():
    return qf_all_done() + [
        make_match(5, 1, 2, StageType.SEMI_FINAL, a_score=1, b_score=0),
        make_match(6, 5, 6, StageType.SEMI_FINAL, a_score=2, b_score=1),
    ]


# ── get_match_winner_and_loser ────────────────────────────────────────────────


class TestGetMatchWinnerAndLoser:
    def test_team_a_wins_by_score(self):
        m = make_match(1, 10, 20, StageType.QUARTER_FINAL, a_score=2, b_score=1)
        winner, loser = get_match_winner_and_loser(m)
        assert winner == 10
        assert loser == 20

    def test_team_b_wins_by_score(self):
        m = make_match(1, 10, 20, StageType.QUARTER_FINAL, a_score=0, b_score=3)
        winner, loser = get_match_winner_and_loser(m)
        assert winner == 20
        assert loser == 10

    def test_team_a_wins_by_penalties(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=1, b_score=1, a_pen=5, b_pen=3)
        winner, loser = get_match_winner_and_loser(m)
        assert winner == 10
        assert loser == 20

    def test_team_b_wins_by_penalties(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=1, b_score=1, a_pen=3, b_pen=5)
        winner, loser = get_match_winner_and_loser(m)
        assert winner == 20
        assert loser == 10

    def test_missing_score_a_returns_none(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=None, b_score=1)
        assert get_match_winner_and_loser(m) == (None, None)

    def test_missing_score_b_returns_none(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=1, b_score=None)
        assert get_match_winner_and_loser(m) == (None, None)

    def test_tied_score_missing_penalties_returns_none(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=1, b_score=1)
        assert get_match_winner_and_loser(m) == (None, None)

    def test_tied_score_missing_one_penalty_returns_none(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=1, b_score=1, a_pen=4, b_pen=None)
        assert get_match_winner_and_loser(m) == (None, None)

    def test_tied_penalties_returns_none(self):
        m = make_match(1, 10, 20, StageType.FINAL, a_score=1, b_score=1, a_pen=4, b_pen=4)
        assert get_match_winner_and_loser(m) == (None, None)

    def test_penalties_not_used_when_score_differs(self):
        # score is decisive — penalties present but must be ignored
        m = make_match(1, 10, 20, StageType.FINAL, a_score=2, b_score=1, a_pen=3, b_pen=5)
        winner, loser = get_match_winner_and_loser(m)
        assert winner == 10
        assert loser == 20

    def test_one_nil_win(self):
        m = make_match(1, 10, 20, StageType.SEMI_FINAL, a_score=1, b_score=0)
        winner, loser = get_match_winner_and_loser(m)
        assert winner == 10
        assert loser == 20


# ── all_matches_finished ──────────────────────────────────────────────────────


class TestAllMatchesFinished:
    def test_all_finished(self):
        matches = [
            make_match(1, 1, 2, StageType.QUARTER_FINAL),
            make_match(2, 3, 4, StageType.QUARTER_FINAL),
        ]
        assert all_matches_finished(matches) is True

    def test_one_scheduled(self):
        matches = [
            make_match(1, 1, 2, StageType.QUARTER_FINAL),
            make_match(2, 3, 4, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
        ]
        assert all_matches_finished(matches) is False

    def test_one_live(self):
        matches = [
            make_match(1, 1, 2, StageType.QUARTER_FINAL),
            make_match(2, 3, 4, StageType.QUARTER_FINAL, status=StatusType.LIVE),
        ]
        assert all_matches_finished(matches) is False

    def test_one_postponed(self):
        matches = [
            make_match(1, 1, 2, StageType.QUARTER_FINAL),
            make_match(2, 3, 4, StageType.QUARTER_FINAL, status=StatusType.POSTPONED),
        ]
        assert all_matches_finished(matches) is False

    def test_one_cancelled(self):
        matches = [
            make_match(1, 1, 2, StageType.QUARTER_FINAL),
            make_match(2, 3, 4, StageType.QUARTER_FINAL, status=StatusType.CANCELLED),
        ]
        assert all_matches_finished(matches) is False

    def test_single_finished(self):
        assert all_matches_finished([make_match(1, 1, 2, StageType.FINAL)]) is True

    def test_single_scheduled(self):
        assert (
            all_matches_finished(
                [make_match(1, 1, 2, StageType.FINAL, status=StatusType.SCHEDULED)]
            )
            is False
        )


# ── build_standings_lookup ────────────────────────────────────────────────────


class TestBuildStandingsLookup:
    def test_computes_goal_difference(self):
        s = make_standing(1, goals_for=5, goals_against=2)
        by_id, _ = build_standings_lookup([s])
        assert by_id[1]["goal_difference"] == 3

    def test_negative_goal_difference(self):
        s = make_standing(1, goals_for=1, goals_against=4)
        by_id, _ = build_standings_lookup([s])
        assert by_id[1]["goal_difference"] == -3

    def test_all_team_ids_collected(self):
        standings = [make_standing(1), make_standing(2), make_standing(3)]
        _, all_ids = build_standings_lookup(standings)
        assert all_ids == {1, 2, 3}

    def test_team_name_extracted(self):
        s = make_standing(1, name="Argentina")
        by_id, _ = build_standings_lookup([s])
        assert by_id[1]["team_name"] == "Argentina"

    def test_none_goals_treated_as_zero(self):
        s = make_standing(1)
        s.goals_for = None
        s.goals_against = None
        by_id, _ = build_standings_lookup([s])
        assert by_id[1]["goals_for"] == 0
        assert by_id[1]["goal_difference"] == 0


# ── assign_rank_bucket ────────────────────────────────────────────────────────


class TestAssignRankBucket:
    def test_assigns_sequential_ranks_from_starting_rank(self):
        rankings = {}
        lookup = {
            1: {"points": 3, "goal_difference": 2, "goals_for": 3, "team_name": "A"},
            2: {"points": 0, "goal_difference": -2, "goals_for": 1, "team_name": "B"},
        }
        next_rank = assign_rank_bucket(rankings, [1, 2], 5, StageType.QUARTER_FINAL, lookup)
        assert rankings[1].final_rank == 5
        assert rankings[2].final_rank == 6
        assert next_rank == 7

    def test_returns_correct_next_rank(self):
        rankings = {}
        lookup = {1: {"points": 0, "goal_difference": 0, "goals_for": 0, "team_name": "A"}}
        next_rank = assign_rank_bucket(rankings, [1], 3, StageType.ROUND_OF_16, lookup)
        assert next_rank == 4

    def test_skips_already_ranked_teams(self):
        from app.schemas.tournament_teams import TeamRankingRefreshRow

        rankings = {
            1: TeamRankingRefreshRow(team_id=1, final_rank=1, stage_reached=StageType.FINAL)
        }
        lookup = {
            1: {"points": 9, "goal_difference": 5, "goals_for": 6, "team_name": "A"},
            2: {"points": 3, "goal_difference": 1, "goals_for": 2, "team_name": "B"},
        }
        assign_rank_bucket(rankings, [1, 2], 5, StageType.QUARTER_FINAL, lookup)
        assert rankings[1].final_rank == 1
        assert rankings[2].final_rank == 5

    def test_deduplicates_team_ids(self):
        rankings = {}
        lookup = {1: {"points": 0, "goal_difference": 0, "goals_for": 0, "team_name": "A"}}
        assign_rank_bucket(rankings, [1, 1, 1], 1, StageType.QUARTER_FINAL, lookup)
        assert len(rankings) == 1
        assert rankings[1].final_rank == 1

    def test_tiebreaker_points_first(self):
        rankings = {}
        lookup = {
            1: {"points": 6, "goal_difference": 1, "goals_for": 3, "team_name": "B"},
            2: {"points": 9, "goal_difference": 1, "goals_for": 3, "team_name": "A"},
        }
        assign_rank_bucket(rankings, [1, 2], 1, StageType.QUARTER_FINAL, lookup)
        assert rankings[2].final_rank == 1
        assert rankings[1].final_rank == 2

    def test_tiebreaker_goal_difference_second(self):
        rankings = {}
        lookup = {
            1: {"points": 6, "goal_difference": 1, "goals_for": 3, "team_name": "B"},
            2: {"points": 6, "goal_difference": 3, "goals_for": 3, "team_name": "A"},
        }
        assign_rank_bucket(rankings, [1, 2], 1, StageType.QUARTER_FINAL, lookup)
        assert rankings[2].final_rank == 1
        assert rankings[1].final_rank == 2

    def test_tiebreaker_goals_for_third(self):
        rankings = {}
        lookup = {
            1: {"points": 6, "goal_difference": 2, "goals_for": 3, "team_name": "B"},
            2: {"points": 6, "goal_difference": 2, "goals_for": 5, "team_name": "A"},
        }
        assign_rank_bucket(rankings, [1, 2], 1, StageType.QUARTER_FINAL, lookup)
        assert rankings[2].final_rank == 1
        assert rankings[1].final_rank == 2

    def test_tiebreaker_name_last(self):
        rankings = {}
        lookup = {
            1: {"points": 6, "goal_difference": 2, "goals_for": 3, "team_name": "Zzz"},
            2: {"points": 6, "goal_difference": 2, "goals_for": 3, "team_name": "Aaa"},
        }
        assign_rank_bucket(rankings, [1, 2], 1, StageType.QUARTER_FINAL, lookup)
        assert rankings[2].final_rank == 1
        assert rankings[1].final_rank == 2

    def test_sets_correct_stage_reached(self):
        rankings = {}
        lookup = {1: {"points": 0, "goal_difference": 0, "goals_for": 0, "team_name": "A"}}
        assign_rank_bucket(rankings, [1], 1, StageType.ROUND_OF_16, lookup)
        assert rankings[1].stage_reached == StageType.ROUND_OF_16


# ── get_knockout_match_context ────────────────────────────────────────────────


class TestGetKnockoutMatchContext:
    def test_group_matches_ignored(self):
        matches = [make_match(1, 1, 2, StageType.GROUP, a_score=1, b_score=0)]
        by_stage, latest = get_knockout_match_context(matches)
        assert latest == {}
        assert all(len(v) == 0 for v in by_stage.values())

    def test_tracks_latest_stage_per_team(self):
        matches = [
            make_match(1, 1, 2, StageType.ROUND_OF_16, a_score=1, b_score=0),
            make_match(2, 1, 3, StageType.QUARTER_FINAL, a_score=2, b_score=1),
        ]
        _, latest = get_knockout_match_context(matches)
        assert latest[1] == StageType.QUARTER_FINAL

    def test_stage_not_downgraded(self):
        matches = [
            make_match(1, 1, 2, StageType.QUARTER_FINAL, a_score=2, b_score=1),
            make_match(2, 1, 3, StageType.ROUND_OF_16, a_score=1, b_score=0),
        ]
        _, latest = get_knockout_match_context(matches)
        assert latest[1] == StageType.QUARTER_FINAL

    def test_all_matches_collected_regardless_of_status(self):
        matches = [
            make_match(
                1, 1, 2, StageType.QUARTER_FINAL, status=StatusType.FINISHED, a_score=2, b_score=0
            ),
            make_match(2, 3, 4, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
        ]
        by_stage, _ = get_knockout_match_context(matches)
        assert len(by_stage[StageType.QUARTER_FINAL]) == 2

    def test_both_teams_tracked_from_same_match(self):
        matches = [make_match(1, 10, 20, StageType.SEMI_FINAL, a_score=1, b_score=0)]
        _, latest = get_knockout_match_context(matches)
        assert 10 in latest
        assert 20 in latest
        assert latest[10] == StageType.SEMI_FINAL
        assert latest[20] == StageType.SEMI_FINAL


# ── derive_team_rankings ──────────────────────────────────────────────────────


class TestDeriveTeamRankings:
    # ── group stage ───────────────────────────────────────────────────────────

    def test_group_stage_no_matches_returns_empty(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=[],
        )
        assert derive_team_rankings(db, 1) == []

    def test_no_standings_no_matches_returns_empty(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=[],
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=[],
        )
        assert derive_team_rankings(db, 1) == []

    def test_group_stage_matches_only_returns_empty(self, db, mocker):
        group_matches = [make_match(1, 1, 2, StageType.GROUP, a_score=1, b_score=0)]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=group_matches,
        )
        assert derive_team_rankings(db, 1) == []

    # ── qf partial ────────────────────────────────────────────────────────────

    def test_qf_partial_no_final_ranks_assigned(self, db, mocker):
        matches = [
            make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
            make_match(2, 5, 4, StageType.QUARTER_FINAL, a_score=1, b_score=0),
            make_match(3, 2, 7, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
            make_match(4, 6, 3, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert all(r.final_rank is None for r in rows)

    def test_qf_partial_all_8_teams_present(self, db, mocker):
        matches = [
            make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
            make_match(2, 5, 4, StageType.QUARTER_FINAL, a_score=1, b_score=0),
            make_match(3, 2, 7, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
            make_match(4, 6, 3, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert {r.team_id for r in rows} == {1, 2, 3, 4, 5, 6, 7, 8}

    # ── qf all done ───────────────────────────────────────────────────────────

    def test_qf_all_done_losers_get_ranks(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        for team_id in [8, 4, 7, 3]:
            assert r[team_id] is not None

    def test_qf_all_done_winners_are_active(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        for team_id in [1, 5, 2, 6]:
            assert r[team_id] is None

    def test_qf_all_done_winners_have_stage_reached_qf(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        s = stages_of(rows)
        for team_id in [1, 5, 2, 6]:
            assert s[team_id] == StageType.QUARTER_FINAL

    def test_qf_all_done_losers_have_stage_reached_qf(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        s = stages_of(rows)
        for team_id in [8, 4, 7, 3]:
            assert s[team_id] == StageType.QUARTER_FINAL

    def test_qf_ranks_start_at_1_when_no_final(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        finalized = sorted([v for v in r.values() if v is not None])
        assert finalized[0] == 1

    def test_qf_all_done_all_8_teams_present(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        assert {r.team_id for r in rows} == {1, 2, 3, 4, 5, 6, 7, 8}

    # ── sf partial ────────────────────────────────────────────────────────────

    def test_sf_partial_sf_losers_not_ranked(self, db, mocker):
        matches = qf_all_done() + [
            make_match(5, 1, 2, StageType.SEMI_FINAL, a_score=1, b_score=0),
            make_match(6, 5, 6, StageType.SEMI_FINAL, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[2] is None

    def test_sf_partial_qf_losers_still_ranked(self, db, mocker):
        matches = qf_all_done() + [
            make_match(5, 1, 2, StageType.SEMI_FINAL, a_score=1, b_score=0),
            make_match(6, 5, 6, StageType.SEMI_FINAL, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        for team_id in [8, 4, 7, 3]:
            assert r[team_id] is not None

    # ── sf all done, no third place ───────────────────────────────────────────

    def test_sf_done_no_third_place_sf_losers_get_ranks(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        assert r[2] is not None
        assert r[6] is not None

    def test_sf_done_no_third_place_sf_winners_still_active(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        assert r[1] is None
        assert r[5] is None

    def test_sf_done_no_third_place_sf_losers_ranked_above_qf_losers(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        sf_loser_ranks = [r[2], r[6]]
        qf_loser_ranks = [r[8], r[4], r[7], r[3]]
        assert max(sf_loser_ranks) < min(qf_loser_ranks)

    # ── third place scheduled but not played ─────────────────────────────────

    def test_third_place_scheduled_sf_losers_keep_ranks(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        assert r[2] is not None
        assert r[6] is not None

    def test_third_place_scheduled_does_not_override_sf_ranks(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        without_3p = derive_team_rankings(db, 1)

        matches_with_3p = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches_with_3p,
        )
        with_3p = derive_team_rankings(db, 1)

        assert ranks_of(without_3p)[2] == ranks_of(with_3p)[2]
        assert ranks_of(without_3p)[6] == ranks_of(with_3p)[6]

    # ── complete tournament with third place ──────────────────────────────────

    def test_complete_with_third_place_champion_rank_1(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[1] == 1

    def test_complete_with_third_place_runner_up_rank_2(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[5] == 2

    def test_complete_with_third_place_winner_rank_3(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[2] == 3

    def test_complete_with_third_place_loser_rank_4(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[6] == 4

    def test_complete_all_8_teams_have_final_rank(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert all(r.final_rank is not None for r in rows)

    def test_complete_group_exits_ranked_after_final(self, db, mocker):
        extra_standings = standings_8() + [
            make_standing(9, "C", points=9, goals_for=5, goals_against=0, wins=3, name="Italy"),
            make_standing(10, "C", points=0, goals_for=0, goals_against=5, losses=3, name="Japan"),
        ]
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=extra_standings,
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        assert r[9] is not None
        assert r[10] is not None

    def test_group_exits_not_ranked_before_final(self, db, mocker):
        extra_standings = standings_8() + [
            make_standing(9, "C", points=9, goals_for=5, goals_against=0, wins=3, name="Italy"),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=extra_standings,
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[9] is None

    def test_group_exits_stage_reached_is_none_before_final(self, db, mocker):
        extra_standings = standings_8() + [
            make_standing(9, "C", points=9, goals_for=5, goals_against=0, wins=3, name="Italy"),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=extra_standings,
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        assert stages_of(rows)[9] is None

    # ── complete tournament without third place (Copa style) ──────────────────

    def test_copa_style_champion_rank_1(self, db, mocker):
        matches = sf_all_done() + [make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1)]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[1] == 1

    def test_copa_style_runner_up_rank_2(self, db, mocker):
        matches = sf_all_done() + [make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1)]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[5] == 2

    def test_copa_style_sf_losers_ranked_3_and_4(self, db, mocker):
        matches = sf_all_done() + [make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1)]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        assert sorted([r[2], r[6]]) == [3, 4]

    # ── penalty final ─────────────────────────────────────────────────────────

    def test_penalty_final_correct_winner(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=1, b_score=1, a_pen=3, b_pen=5),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        r = ranks_of(rows)
        assert r[5] == 1
        assert r[1] == 2

    def test_penalty_final_loser_not_champion(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=1, b_score=1, a_pen=3, b_pen=5),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[1] != 1

    # ── blocked by non-finished matches ───────────────────────────────────────

    def test_postponed_qf_blocks_all_qf_ranking(self, db, mocker):
        matches = [
            make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
            make_match(2, 5, 4, StageType.QUARTER_FINAL, a_score=1, b_score=0),
            make_match(3, 2, 7, StageType.QUARTER_FINAL, a_score=3, b_score=1),
            make_match(4, 6, 3, StageType.QUARTER_FINAL, status=StatusType.POSTPONED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert all(r.final_rank is None for r in rows)

    def test_cancelled_qf_blocks_all_qf_ranking(self, db, mocker):
        matches = [
            make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
            make_match(2, 5, 4, StageType.QUARTER_FINAL, a_score=1, b_score=0),
            make_match(3, 2, 7, StageType.QUARTER_FINAL, a_score=3, b_score=1),
            make_match(4, 6, 3, StageType.QUARTER_FINAL, status=StatusType.CANCELLED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert all(r.final_rank is None for r in rows)

    def test_live_qf_blocks_ranking(self, db, mocker):
        matches = [
            make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
            make_match(2, 5, 4, StageType.QUARTER_FINAL, a_score=1, b_score=0),
            make_match(3, 2, 7, StageType.QUARTER_FINAL, a_score=3, b_score=1),
            make_match(4, 6, 3, StageType.QUARTER_FINAL, status=StatusType.LIVE),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert all(r.final_rank is None for r in rows)

    # ── all teams always present in rows ─────────────────────────────────────

    def test_all_teams_in_rows_during_qf_partial(self, db, mocker):
        matches = [
            make_match(1, 1, 8, StageType.QUARTER_FINAL, a_score=2, b_score=0),
            make_match(2, 5, 4, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
            make_match(3, 2, 7, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
            make_match(4, 6, 3, StageType.QUARTER_FINAL, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert {r.team_id for r in rows} == {1, 2, 3, 4, 5, 6, 7, 8}

    def test_all_teams_in_rows_during_sf(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=sf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        assert {r.team_id for r in rows} == {1, 2, 3, 4, 5, 6, 7, 8}

    def test_final_scheduled_group_exits_still_unranked(self, db, mocker):
        extra_standings = standings_8() + [
            make_standing(9, "C", points=9, goals_for=5, goals_against=0, wins=3, name="Italy"),
        ]
        matches = sf_all_done() + [
            make_match(8, 1, 5, StageType.FINAL, status=StatusType.SCHEDULED),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=extra_standings,
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        assert ranks_of(rows)[9] is None

    # ── stage_reached correctness ─────────────────────────────────────────────

    def test_champion_stage_reached_is_final(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        s = stages_of(rows)
        assert s[1] == StageType.FINAL
        assert s[5] == StageType.FINAL

    def test_third_place_teams_stage_reached_is_third_place(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        s = stages_of(rows)
        assert s[2] == StageType.THIRD_PLACE
        assert s[6] == StageType.THIRD_PLACE

    def test_qf_losers_stage_reached_is_qf(self, db, mocker):
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=qf_all_done(),
        )
        rows = derive_team_rankings(db, 1)
        s = stages_of(rows)
        for team_id in [8, 4, 7, 3]:
            assert s[team_id] == StageType.QUARTER_FINAL

    # ── rank uniqueness ───────────────────────────────────────────────────────

    def test_complete_tournament_no_duplicate_ranks(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        final_ranks = [r.final_rank for r in rows if r.final_rank is not None]
        assert len(final_ranks) == len(set(final_ranks))

    def test_complete_tournament_ranks_are_contiguous(self, db, mocker):
        matches = sf_all_done() + [
            make_match(7, 2, 6, StageType.THIRD_PLACE, a_score=1, b_score=0),
            make_match(8, 1, 5, StageType.FINAL, a_score=2, b_score=1),
        ]
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.standings_repo.get_all_standings",
            return_value=standings_8(),
        )
        mocker.patch(
            "app.api.v1.services.refresh_team_rankings.matches_repo.get_matches_by_tournament",
            return_value=matches,
        )
        rows = derive_team_rankings(db, 1)
        final_ranks = sorted([r.final_rank for r in rows if r.final_rank is not None])
        assert final_ranks == list(range(1, len(final_ranks) + 1))
