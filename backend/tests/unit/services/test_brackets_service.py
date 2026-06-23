from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest

from app.api.v1.services import brackets as brackets_service
from app.models.enums import StageType, StatusType


def make_team(team_id: int, name: str = "France"):
    return SimpleNamespace(
        id=team_id,
        name=name,
        short_name=name[:3].upper(),
        logo_url=f"https://example.com/{team_id}.png",
    )


def make_match(
    *,
    match_id: int = 1,
    stage: StageType = StageType.FINAL,
    status: StatusType = StatusType.SCHEDULED,
):
    return SimpleNamespace(
        id=match_id,
        team_a=make_team(1, "France"),
        team_b=make_team(2, "Argentina"),
        kickoff_time=datetime(2026, 7, 19, 18, 0, tzinfo=UTC),
        stage=stage,
        group=None,
        status=status,
        venue="MetLife Stadium",
        city="New York",
        elapsed=None,
        team_a_score=None,
        team_b_score=None,
        team_a_penalties=None,
        team_b_penalties=None,
    )


def test_create_bracket_groups_knockout_matches_by_stage():
    matches = [
        make_match(match_id=1, stage=StageType.QUARTER_FINAL),
        make_match(match_id=2, stage=StageType.QUARTER_FINAL),
        make_match(match_id=3, stage=StageType.SEMI_FINAL),
        make_match(match_id=4, stage=StageType.THIRD_PLACE),
        make_match(match_id=5, stage=StageType.FINAL),
    ]

    bracket = brackets_service.create_bracket(matches)

    assert [match.id for match in bracket.quarter_final] == [1, 2]
    assert [match.id for match in bracket.semi_final] == [3]
    assert [match.id for match in bracket.third_place] == [4]
    assert [match.id for match in bracket.final] == [5]

    assert bracket.round_of_32 == []
    assert bracket.round_of_16 == []


@pytest.mark.parametrize(
    "stage",
    [
        StageType.ROUND_OF_32,
        StageType.ROUND_OF_16,
        StageType.QUARTER_FINAL,
        StageType.SEMI_FINAL,
        StageType.THIRD_PLACE,
        StageType.FINAL,
    ],
)
def test_create_bracket_supports_every_bracket_stage(stage):
    match = make_match(match_id=9, stage=stage)

    bracket = brackets_service.create_bracket([match])

    assert len(getattr(bracket, stage.value)) == 1
    assert getattr(bracket, stage.value)[0].id == 9


@pytest.mark.parametrize(
    "stage",
    [
        StageType.GROUP,
        StageType.OTHER,
    ],
)
def test_create_bracket_ignores_non_bracket_stages(stage):
    match = make_match(match_id=99, stage=stage)

    bracket = brackets_service.create_bracket([match])

    assert bracket.round_of_32 == []
    assert bracket.round_of_16 == []
    assert bracket.quarter_final == []
    assert bracket.semi_final == []
    assert bracket.third_place == []
    assert bracket.final == []


def test_create_bracket_validates_matches_into_match_summary_shape():
    match = make_match(
        match_id=1,
        stage=StageType.FINAL,
        status=StatusType.FINISHED,
    )

    bracket = brackets_service.create_bracket([match])

    final_match = bracket.final[0]

    assert final_match.id == 1
    assert final_match.stage == StageType.FINAL
    assert final_match.status == StatusType.FINISHED
    assert final_match.team_a.name == "France"
    assert final_match.team_b.name == "Argentina"

    # This catches the raw-SQLAlchemy-object append bug that serializes as `{}`.
    assert final_match.__class__.__name__ == "MatchSummary"


def test_get_bracket_returns_cached_response_without_fetching_db(mocker):
    db = mocker.Mock()
    cached_payload = {
        "round_of_32": [],
        "round_of_16": [],
        "quarter_final": [],
        "semi_final": [],
        "third_place": [],
        "final": [
            {
                "id": 1,
                "team_a": {
                    "id": 1,
                    "name": "France",
                    "short_name": "FRA",
                    "logo_url": "https://example.com/1.png",
                },
                "team_b": {
                    "id": 2,
                    "name": "Argentina",
                    "short_name": "ARG",
                    "logo_url": "https://example.com/2.png",
                },
                "kickoff_time": "2026-07-19T18:00:00Z",
                "stage": "final",
                "group": None,
                "status": "scheduled",
                "venue": "MetLife Stadium",
                "city": "New York",
                "elapsed": None,
                "team_a_score": None,
                "team_b_score": None,
                "team_a_penalties": None,
                "team_b_penalties": None,
            }
        ],
    }

    get_cache = mocker.patch.object(
        brackets_service.cache_service,
        "get_cache",
        return_value=cached_payload,
    )
    get_tournament = mocker.patch.object(
        brackets_service.tournaments_service,
        "get_tournament",
    )
    get_matches = mocker.patch.object(
        brackets_service.matches_repo,
        "get_matches_by_tournament",
    )
    set_cache = mocker.patch.object(
        brackets_service.cache_service,
        "set_cache",
    )

    result = brackets_service.get_bracket(db, tournament_id=7)

    get_cache.assert_called_once_with(db, "bracket:7")
    get_tournament.assert_not_called()
    get_matches.assert_not_called()
    set_cache.assert_not_called()

    assert len(result.final) == 1
    assert result.final[0].id == 1
    assert result.final[0].stage == StageType.FINAL
    assert result.final[0].team_a.short_name == "FRA"


def test_get_bracket_fetches_builds_caches_and_returns_bracket_on_cache_miss(mocker):
    db = mocker.Mock()
    tournament = SimpleNamespace(id=7)
    ttl = timedelta(minutes=15)
    expires_at = datetime(2026, 6, 23, 12, 0, tzinfo=UTC)
    matches = [
        make_match(match_id=1, stage=StageType.QUARTER_FINAL),
        make_match(match_id=2, stage=StageType.FINAL),
    ]

    mocker.patch.object(
        brackets_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        brackets_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    get_matches = mocker.patch.object(
        brackets_service.matches_repo,
        "get_matches_by_tournament",
        return_value=matches,
    )
    get_ttl = mocker.patch.object(
        brackets_service,
        "get_tournament_data_ttl",
        return_value=ttl,
    )
    get_expires_at = mocker.patch.object(
        brackets_service,
        "get_expires_at",
        return_value=expires_at,
    )
    set_cache = mocker.patch.object(
        brackets_service.cache_service,
        "set_cache",
    )

    result = brackets_service.get_bracket(db, tournament_id=7)

    get_tournament.assert_called_once_with(db, 7)
    get_matches.assert_called_once_with(db, 7)
    get_ttl.assert_called_once_with(tournament)
    get_expires_at.assert_called_once_with(ttl)

    assert [match.id for match in result.quarter_final] == [1]
    assert [match.id for match in result.final] == [2]

    set_cache.assert_called_once()
    args, kwargs = set_cache.call_args

    assert args[0] is db
    assert args[1] == "bracket:7"
    assert kwargs["expires_at"] == expires_at

    payload = kwargs["payload"]
    assert payload["quarter_final"][0]["id"] == 1
    assert payload["final"][0]["id"] == 2
    assert payload["final"][0]["stage"] == "final"


def test_get_bracket_caches_empty_bracket_response(mocker):
    db = mocker.Mock()
    tournament = SimpleNamespace(id=7)
    ttl = timedelta(hours=1)
    expires_at = datetime(2026, 6, 23, 12, 0, tzinfo=UTC)

    mocker.patch.object(
        brackets_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        brackets_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    mocker.patch.object(
        brackets_service.matches_repo,
        "get_matches_by_tournament",
        return_value=[],
    )
    mocker.patch.object(
        brackets_service,
        "get_tournament_data_ttl",
        return_value=ttl,
    )
    mocker.patch.object(
        brackets_service,
        "get_expires_at",
        return_value=expires_at,
    )
    set_cache = mocker.patch.object(
        brackets_service.cache_service,
        "set_cache",
    )

    result = brackets_service.get_bracket(db, tournament_id=7)

    assert result.round_of_32 == []
    assert result.round_of_16 == []
    assert result.quarter_final == []
    assert result.semi_final == []
    assert result.third_place == []
    assert result.final == []

    args, kwargs = set_cache.call_args
    assert args[1] == "bracket:7"
    assert kwargs["payload"] == {
        "round_of_32": [],
        "round_of_16": [],
        "quarter_final": [],
        "semi_final": [],
        "third_place": [],
        "final": [],
    }


def test_get_bracket_treats_empty_dict_cache_as_cache_hit(mocker):
    db = mocker.Mock()

    mocker.patch.object(
        brackets_service.cache_service,
        "get_cache",
        return_value={},
    )
    get_tournament = mocker.patch.object(
        brackets_service.tournaments_service,
        "get_tournament",
    )
    get_matches = mocker.patch.object(
        brackets_service.matches_repo,
        "get_matches_by_tournament",
    )
    set_cache = mocker.patch.object(
        brackets_service.cache_service,
        "set_cache",
    )

    result = brackets_service.get_bracket(db, tournament_id=7)

    get_tournament.assert_not_called()
    get_matches.assert_not_called()
    set_cache.assert_not_called()

    assert result.round_of_32 == []
    assert result.round_of_16 == []
    assert result.quarter_final == []
    assert result.semi_final == []
    assert result.third_place == []
    assert result.final == []
