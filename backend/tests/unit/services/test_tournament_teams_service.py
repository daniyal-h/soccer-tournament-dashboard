from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.api.v1.services import tournament_teams as tournament_teams_service
from app.constants.team_rankings import STAGE_SORT_ORDER
from app.models.enums import StageType
from app.schemas.errors import NotFoundError
from app.schemas.tournament_teams import TeamRankingRefreshRow


def test_get_tournament_teams_returns_rows(mocker):
    db = Mock()
    mock_rows = [Mock(), Mock()]

    mocker.patch(
        "app.api.v1.services.tournament_teams.tournament_teams_repo.get_teams_in_tournament",
        return_value=mock_rows,
    )

    result = tournament_teams_service.get_tournament_teams(db, tournament_id=1)
    assert result == mock_rows


def test_get_tournament_teams_raises_not_found_when_empty(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.tournament_teams.tournament_teams_repo.get_teams_in_tournament",
        return_value=[],
    )

    with pytest.raises(NotFoundError, match="No teams found in tournament 1"):
        tournament_teams_service.get_tournament_teams(db, tournament_id=1)


def test_get_tournament_teams_calls_repo_with_correct_args(mocker):
    db = Mock()

    get_teams = mocker.patch(
        "app.api.v1.services.tournament_teams.tournament_teams_repo.get_teams_in_tournament",
        return_value=[Mock()],
    )

    tournament_teams_service.get_tournament_teams(db, tournament_id=42)
    get_teams.assert_called_once_with(db, 42)


def test_get_team_group_returns_group_when_team_is_registered(mocker):
    db = Mock()
    row = Mock(group="A")

    get_team = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_team_in_tournament",
        return_value=row,
    )

    result = tournament_teams_service.get_team_group(
        db,
        tournament_id=1,
        team_id=101,
    )

    assert result == "A"
    get_team.assert_called_once_with(db, 1, 101)


def test_get_team_group_returns_none_when_team_is_not_registered(mocker):
    db = Mock()

    get_team = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_team_in_tournament",
        return_value=None,
    )

    result = tournament_teams_service.get_team_group(
        db,
        tournament_id=1,
        team_id=101,
    )

    assert result is None
    get_team.assert_called_once_with(db, 1, 101)


def make_tournament_team_row(
    team_name: str,
    final_rank: int | None = None,
    stage_reached: StageType | None = None,
):
    return SimpleNamespace(
        final_rank=final_rank,
        stage_reached=stage_reached,
        team=SimpleNamespace(name=team_name),
    )


def test_display_sort_key_active_knockout_team_uses_progress_bucket_stage_and_name():
    row = make_tournament_team_row(
        team_name="Argentina",
        final_rank=None,
        stage_reached=StageType.SEMI_FINAL,
    )

    result = tournament_teams_service.get_tournament_team_display_sort_key(row)

    assert result == (
        0,
        STAGE_SORT_ORDER[StageType.SEMI_FINAL],
        "Argentina",
    )


def test_display_sort_key_final_ranked_team_uses_rank_bucket_rank_and_name():
    row = make_tournament_team_row(
        team_name="Brazil",
        final_rank=2,
        stage_reached=StageType.FINAL,
    )

    result = tournament_teams_service.get_tournament_team_display_sort_key(row)

    assert result == (1, 2, "Brazil")


def test_display_sort_key_unranked_team_uses_unranked_bucket_and_name():
    row = make_tournament_team_row(
        team_name="Canada",
        final_rank=None,
        stage_reached=None,
    )

    result = tournament_teams_service.get_tournament_team_display_sort_key(row)

    assert result == (2, 0, "Canada")


def test_display_sort_orders_active_then_ranked_then_unranked_teams():
    active_final = make_tournament_team_row("Argentina", stage_reached=StageType.FINAL)
    active_qf = make_tournament_team_row("Brazil", stage_reached=StageType.QUARTER_FINAL)
    ranked_first = make_tournament_team_row("France", final_rank=1)
    ranked_second = make_tournament_team_row("England", final_rank=2)
    unranked_a = make_tournament_team_row("Canada")
    unranked_b = make_tournament_team_row("Denmark")

    rows = [
        unranked_b,
        ranked_second,
        active_qf,
        unranked_a,
        ranked_first,
        active_final,
    ]

    result = sorted(rows, key=tournament_teams_service.get_tournament_team_display_sort_key)

    assert result == [
        active_final,
        active_qf,
        ranked_first,
        ranked_second,
        unranked_a,
        unranked_b,
    ]


def test_display_sort_key_active_team_with_unknown_stage_uses_fallback_after_known_stages():
    known_active = make_tournament_team_row(
        team_name="Argentina",
        final_rank=None,
        stage_reached=StageType.GROUP,
    )
    unknown_active = make_tournament_team_row(
        team_name="Mystery FC",
        final_rank=None,
        stage_reached="mystery_stage",
    )

    known_key = tournament_teams_service.get_tournament_team_display_sort_key(known_active)
    unknown_key = tournament_teams_service.get_tournament_team_display_sort_key(unknown_active)

    assert unknown_key == (0, 99, "Mystery FC")
    assert known_key[0] == unknown_key[0]
    assert unknown_key[1] > known_key[1]


def test_display_sort_orders_unknown_active_stage_after_known_active_stages():
    active_final = make_tournament_team_row("Argentina", stage_reached=StageType.FINAL)
    active_unknown = make_tournament_team_row("Mystery FC", stage_reached="mystery_stage")
    active_qf = make_tournament_team_row("Brazil", stage_reached=StageType.QUARTER_FINAL)

    rows = [active_unknown, active_qf, active_final]

    result = sorted(rows, key=tournament_teams_service.get_tournament_team_display_sort_key)

    assert result == [active_final, active_qf, active_unknown]


def test_get_ranked_tournament_teams_returns_cached_rows_without_repo_calls(mocker):
    db = Mock()
    cached_rows = [{"team_id": 1, "team": {"name": "Cached FC"}}]

    get_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "get_cache",
        return_value=cached_rows,
    )
    get_tournament = mocker.patch.object(
        tournament_teams_service.tournaments_service,
        "get_tournament",
    )
    get_teams = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_teams_in_tournament",
    )
    set_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "set_cache",
    )

    result = tournament_teams_service.get_ranked_tournament_teams(db, tournament_id=1)

    assert result == cached_rows
    get_cache.assert_called_once_with(db, "teams:1")
    get_tournament.assert_not_called()
    get_teams.assert_not_called()
    set_cache.assert_not_called()


def test_get_ranked_tournament_teams_raises_not_found_when_repo_returns_empty(mocker):
    db = Mock()
    tournament = Mock()

    mocker.patch.object(
        tournament_teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        tournament_teams_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    get_teams = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_teams_in_tournament",
        return_value=[],
    )
    set_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="No teams found in tournament 1"):
        tournament_teams_service.get_ranked_tournament_teams(db, tournament_id=1)

    get_tournament.assert_called_once_with(db, 1)
    get_teams.assert_called_once_with(db, 1)
    set_cache.assert_not_called()


def test_get_ranked_tournament_teams_sorts_rows_and_caches_encoded_payload(mocker):
    db = Mock()
    tournament = Mock()

    active_final = make_tournament_team_row("Argentina", stage_reached=StageType.FINAL)
    ranked_first = make_tournament_team_row("France", final_rank=1)
    unranked = make_tournament_team_row("Canada")

    unsorted_rows = [unranked, ranked_first, active_final]
    sorted_rows = [active_final, ranked_first, unranked]
    encoded_rows = [{"encoded": True}]
    expires_at = Mock(name="expires_at")

    mocker.patch.object(
        tournament_teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        tournament_teams_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    get_teams = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_teams_in_tournament",
        return_value=unsorted_rows,
    )
    get_ttl = mocker.patch(
        "app.api.v1.services.tournament_teams.get_teams_ttl",
        return_value=300,
    )
    get_expires_at = mocker.patch(
        "app.api.v1.services.tournament_teams.get_expires_at",
        return_value=expires_at,
    )
    jsonable_encoder = mocker.patch(
        "app.api.v1.services.tournament_teams.jsonable_encoder",
        return_value=encoded_rows,
    )
    set_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "set_cache",
    )

    result = tournament_teams_service.get_ranked_tournament_teams(db, tournament_id=1)

    assert result == sorted_rows
    get_tournament.assert_called_once_with(db, 1)
    get_teams.assert_called_once_with(db, 1)
    get_ttl.assert_called_once_with(tournament, unsorted_rows)
    get_expires_at.assert_called_once_with(300)
    jsonable_encoder.assert_called_once_with(sorted_rows)
    set_cache.assert_called_once_with(
        db,
        "teams:1",
        payload=encoded_rows,
        expires_at=expires_at,
    )


def test_get_tournament_team_returns_registered_team(mocker):
    db = Mock()
    tournament_team = Mock()

    get_team = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_team_in_tournament",
        return_value=tournament_team,
    )

    result = tournament_teams_service.get_tournament_team(
        db,
        tournament_id=42,
        team_id=101,
    )

    assert result == tournament_team
    get_team.assert_called_once_with(db, 42, 101)


def test_get_tournament_team_raises_not_found_when_team_is_not_registered(mocker):
    db = Mock()

    get_team = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_team_in_tournament",
        return_value=None,
    )

    with pytest.raises(
        NotFoundError,
        match="Team 101 not found in tournament 42",
    ):
        tournament_teams_service.get_tournament_team(
            db,
            tournament_id=42,
            team_id=101,
        )

    get_team.assert_called_once_with(db, 42, 101)


def test_get_tournament_team_raises_not_found_for_falsey_repo_result(mocker):
    db = Mock()

    get_team = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "get_team_in_tournament",
        return_value=False,
    )

    with pytest.raises(
        NotFoundError,
        match="Team 101 not found in tournament 42",
    ):
        tournament_teams_service.get_tournament_team(
            db,
            tournament_id=42,
            team_id=101,
        )

    get_team.assert_called_once_with(db, 42, 101)


def test_update_team_rankings_updates_each_row_commits_and_invalidates_cache(mocker):
    db = Mock()

    rows = [
        TeamRankingRefreshRow(
            team_id=1,
            final_rank=1,
            stage_reached=StageType.FINAL,
        ),
        TeamRankingRefreshRow(
            team_id=2,
            final_rank=None,
            stage_reached=StageType.SEMI_FINAL,
        ),
    ]

    update_row = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "update_team_ranking_by_id",
    )
    invalidate_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "invalidate_cache",
    )

    tournament_teams_service.update_team_rankings(db, tournament_id=42, data=rows)

    assert update_row.call_count == 2
    update_row.assert_has_calls(
        [
            mocker.call(db, 42, rows[0]),
            mocker.call(db, 42, rows[1]),
        ]
    )
    db.commit.assert_called_once_with()
    invalidate_cache.assert_called_once_with(db, "teams:42")


def test_update_team_rankings_allows_empty_rows_but_still_commits_and_invalidates_cache(mocker):
    db = Mock()

    update_row = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "update_team_ranking_by_id",
    )
    invalidate_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "invalidate_cache",
    )

    tournament_teams_service.update_team_rankings(db, tournament_id=42, data=[])

    update_row.assert_not_called()
    db.commit.assert_called_once_with()
    invalidate_cache.assert_called_once_with(db, "teams:42")


def test_update_team_rankings_does_not_commit_or_invalidate_when_repo_update_fails(mocker):
    db = Mock()
    rows = [
        TeamRankingRefreshRow(
            team_id=1,
            final_rank=1,
            stage_reached=StageType.FINAL,
        ),
        TeamRankingRefreshRow(
            team_id=2,
            final_rank=2,
            stage_reached=StageType.FINAL,
        ),
    ]

    update_row = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "update_team_ranking_by_id",
        side_effect=RuntimeError("db update failed"),
    )
    invalidate_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "invalidate_cache",
    )

    with pytest.raises(RuntimeError, match="db update failed"):
        tournament_teams_service.update_team_rankings(db, tournament_id=42, data=rows)

    update_row.assert_called_once_with(db, 42, rows[0])
    db.commit.assert_not_called()
    invalidate_cache.assert_not_called()


def test_update_team_rankings_does_not_invalidate_cache_when_commit_fails(mocker):
    db = Mock()
    db.commit.side_effect = RuntimeError("commit failed")

    rows = [
        TeamRankingRefreshRow(
            team_id=1,
            final_rank=1,
            stage_reached=StageType.FINAL,
        ),
    ]

    update_row = mocker.patch.object(
        tournament_teams_service.tournament_teams_repo,
        "update_team_ranking_by_id",
    )
    invalidate_cache = mocker.patch.object(
        tournament_teams_service.cache_service,
        "invalidate_cache",
    )

    with pytest.raises(RuntimeError, match="commit failed"):
        tournament_teams_service.update_team_rankings(db, tournament_id=42, data=rows)

    update_row.assert_called_once_with(db, 42, rows[0])
    db.commit.assert_called_once_with()
    invalidate_cache.assert_not_called()


def test_validate_team_in_tournament_returns_none_when_team_exists(mocker):
    db = Mock()
    tournament_team = Mock()

    get_tournament_team = mocker.patch.object(
        tournament_teams_service,
        "get_tournament_team",
        return_value=tournament_team,
    )

    result = tournament_teams_service.validate_team_in_tournament(
        db,
        tournament_id=1,
        team_id=32,
    )

    assert result is None
    get_tournament_team.assert_called_once_with(db, 1, 32)


def test_validate_team_in_tournament_raises_not_found_when_team_missing(mocker):
    db = Mock()

    get_tournament_team = mocker.patch.object(
        tournament_teams_service,
        "get_tournament_team",
        side_effect=NotFoundError("Team 32 not found in tournament 1"),
    )

    with pytest.raises(NotFoundError, match="Team 32 not found in tournament 1"):
        tournament_teams_service.validate_team_in_tournament(
            db,
            tournament_id=1,
            team_id=32,
        )

    get_tournament_team.assert_called_once_with(db, 1, 32)


def test_validate_team_in_tournament_does_not_return_tournament_team_row(mocker):
    db = Mock()
    tournament_team = Mock()

    mocker.patch.object(
        tournament_teams_service,
        "get_tournament_team",
        return_value=tournament_team,
    )

    result = tournament_teams_service.validate_team_in_tournament(
        db,
        tournament_id=1,
        team_id=32,
    )

    assert result is None
    assert result is not tournament_team
