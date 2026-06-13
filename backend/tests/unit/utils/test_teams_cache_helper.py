from datetime import UTC, date, datetime

from app.constants.cache_ttl import (
    TEAMS_FINISHED_TTL,
    TEAMS_GROUP_STAGE_TTL,
    TEAMS_KNOCKOUT_TTL,
    TEAMS_PRE_TOURNAMENT_FAR_TTL,
    TEAMS_PRE_TOURNAMENT_SOON_TTL,
)
from app.constants.team_rankings import KNOCKOUT_STAGES
from app.models.match import StageType
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam
from app.utils.cache_helper import get_teams_ttl


def create_tournament(
    start_date: date = date(2026, 6, 11),
    end_date: date = date(2026, 7, 19),
) -> Tournament:
    return Tournament(
        id=1,
        external_api_id=1,
        name="World Cup",
        season="2026",
        start_date=start_date,
        end_date=end_date,
    )


def create_tournament_team(
    final_rank: int | None = None,
    stage_reached: StageType | None = None,
) -> TournamentTeam:
    return TournamentTeam(
        tournament_id=1,
        team_id=1,
        final_rank=final_rank,
        stage_reached=stage_reached,
    )


def test_get_teams_ttl_returns_finished_ttl_after_tournament_when_all_teams_ranked():
    tournament = create_tournament(end_date=date(2026, 7, 19))
    teams = [
        create_tournament_team(final_rank=1, stage_reached=StageType.FINAL),
        create_tournament_team(final_rank=2, stage_reached=StageType.FINAL),
    ]

    now = datetime(2026, 7, 20, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_FINISHED_TTL


def test_get_teams_ttl_does_not_return_finished_ttl_after_tournament_when_team_rank_missing():
    tournament = create_tournament(end_date=date(2026, 7, 19))
    teams = [
        create_tournament_team(final_rank=1, stage_reached=StageType.FINAL),
        create_tournament_team(final_rank=None, stage_reached=None),
    ]

    now = datetime(2026, 7, 20, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_KNOCKOUT_TTL


def test_get_teams_ttl_returns_far_pre_tournament_ttl_when_more_than_one_day_away():
    tournament = create_tournament(start_date=date(2026, 6, 11))
    teams = [create_tournament_team()]

    now = datetime(2026, 6, 9, 23, 59, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_PRE_TOURNAMENT_FAR_TTL


def test_get_teams_ttl_returns_soon_pre_tournament_ttl_when_within_one_day():
    tournament = create_tournament(start_date=date(2026, 6, 11))
    teams = [create_tournament_team()]

    now = datetime(2026, 6, 10, 0, 1, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_PRE_TOURNAMENT_SOON_TTL


def test_get_teams_ttl_returns_group_stage_ttl_during_tournament_before_knockouts():
    tournament = create_tournament(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )
    teams = [
        create_tournament_team(final_rank=None, stage_reached=None),
        create_tournament_team(final_rank=None, stage_reached=None),
    ]

    now = datetime(2026, 6, 20, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_GROUP_STAGE_TTL


def test_get_teams_ttl_returns_knockout_ttl_when_any_team_has_reached_knockout_stage():
    tournament = create_tournament(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )
    teams = [
        create_tournament_team(final_rank=None, stage_reached=None),
        create_tournament_team(final_rank=None, stage_reached=StageType.ROUND_OF_16),
    ]

    now = datetime(2026, 7, 4, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_KNOCKOUT_TTL


def test_get_teams_ttl_returns_finished_ttl_on_end_date_plus_one_microsecond_when_all_ranked():
    tournament = create_tournament(end_date=date(2026, 7, 19))
    teams = [
        create_tournament_team(final_rank=1, stage_reached=StageType.FINAL),
        create_tournament_team(final_rank=2, stage_reached=StageType.FINAL),
    ]

    now = datetime(2026, 7, 20, 0, 0, 0, 1, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_FINISHED_TTL


def test_get_teams_ttl_does_not_return_finished_ttl_at_exact_tournament_end_boundary():
    tournament = create_tournament(end_date=date(2026, 7, 19))
    teams = [
        create_tournament_team(final_rank=1, stage_reached=StageType.FINAL),
        create_tournament_team(final_rank=2, stage_reached=StageType.FINAL),
    ]

    now = datetime(2026, 7, 19, 0, 0, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_KNOCKOUT_TTL


def test_get_teams_ttl_returns_soon_pre_tournament_ttl_at_exactly_one_day_before_start():
    tournament = create_tournament(start_date=date(2026, 6, 11))
    teams = [create_tournament_team()]

    now = datetime(2026, 6, 10, 0, 0, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_PRE_TOURNAMENT_SOON_TTL


def test_get_teams_ttl_returns_far_pre_tournament_ttl_one_microsecond_before_soon_window():
    tournament = create_tournament(start_date=date(2026, 6, 11))
    teams = [create_tournament_team()]

    now = datetime(2026, 6, 9, 23, 59, 59, 999999, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_PRE_TOURNAMENT_FAR_TTL


def test_get_teams_ttl_returns_soon_pre_tournament_ttl_one_microsecond_inside_soon_window():
    tournament = create_tournament(start_date=date(2026, 6, 11))
    teams = [create_tournament_team()]

    now = datetime(2026, 6, 10, 0, 0, 0, 1, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_PRE_TOURNAMENT_SOON_TTL


def test_get_teams_ttl_returns_group_stage_ttl_at_exact_tournament_start_without_knockout_stage():
    tournament = create_tournament(start_date=date(2026, 6, 11))
    teams = [
        create_tournament_team(final_rank=None, stage_reached=None),
        create_tournament_team(final_rank=None, stage_reached=StageType.GROUP),
    ]

    now = datetime(2026, 6, 11, 0, 0, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_GROUP_STAGE_TTL


def test_get_teams_ttl_ignores_group_stage_when_detecting_knockout_stage():
    tournament = create_tournament(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )
    teams = [
        create_tournament_team(final_rank=None, stage_reached=StageType.GROUP),
        create_tournament_team(final_rank=None, stage_reached=None),
    ]

    now = datetime(2026, 6, 20, tzinfo=UTC)

    assert get_teams_ttl(tournament, teams, now) == TEAMS_GROUP_STAGE_TTL


def test_get_teams_ttl_returns_knockout_ttl_for_each_knockout_stage():
    tournament = create_tournament(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    for stage in KNOCKOUT_STAGES:
        teams = [create_tournament_team(final_rank=None, stage_reached=stage)]

        now = datetime(2026, 7, 4, tzinfo=UTC)

        assert get_teams_ttl(tournament, teams, now) == TEAMS_KNOCKOUT_TTL


def test_get_teams_ttl_returns_group_stage_ttl_when_teams_list_is_empty_during_tournament():
    tournament = create_tournament(
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    now = datetime(2026, 6, 20, tzinfo=UTC)

    assert get_teams_ttl(tournament, [], now) == TEAMS_GROUP_STAGE_TTL


def test_get_teams_ttl_returns_finished_ttl_when_teams_list_is_empty_after_tournament():
    tournament = create_tournament(end_date=date(2026, 7, 19))

    now = datetime(2026, 7, 20, tzinfo=UTC)

    assert get_teams_ttl(tournament, [], now) == TEAMS_FINISHED_TTL
