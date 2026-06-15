from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.api.v1.services import teams as teams_service
from app.schemas.errors import NotFoundError
from app.schemas.teams import TeamProfileResponse


def test_get_team_id_returns_id_when_found(mocker):
    db = Mock()
    mock_team = Mock(id=42)

    mocker.patch(
        "app.api.v1.services.teams.teams_repo.get_team_from_external_id",
        return_value=mock_team,
    )

    result = teams_service.get_team_id_from_external_id(db, external_api_id=99)

    assert result == 42


def test_get_team_id_raises_not_found_when_missing(mocker):
    db = Mock()

    mocker.patch(
        "app.api.v1.services.teams.teams_repo.get_team_from_external_id",
        return_value=None,
    )

    with pytest.raises(NotFoundError, match="99"):
        teams_service.get_team_id_from_external_id(db, external_api_id=99)


def test_get_team_id_calls_repo_with_correct_args(mocker):
    db = Mock()

    mock_get = mocker.patch(
        "app.api.v1.services.teams.teams_repo.get_team_from_external_id",
        return_value=Mock(id=1),
    )

    teams_service.get_team_id_from_external_id(db, external_api_id=99)

    mock_get.assert_called_once_with(db, 99)


def make_team():
    return SimpleNamespace(
        id=32,
        name="Canada",
        short_name="CAN",
        logo_url="https://example.com/canada.png",
    )


def make_registration(group="B"):
    return SimpleNamespace(
        team=make_team(),
        group=group,
    )


def make_standing():
    return SimpleNamespace(
        group="B",
        position=1,
        points=4,
        wins=1,
        draws=1,
        losses=0,
        goals_for=3,
        goals_against=1,
    )


def test_get_team_profile_returns_cached_response_without_repo_calls(mocker):
    db = Mock()
    cached = {
        "team": {
            "id": 32,
            "name": "Canada",
            "short_name": "CAN",
            "logo_url": "https://example.com/canada.png",
        },
        "group": "B",
        "standing": {
            "group": "B",
            "position": 1,
            "points": 4,
            "wins": 1,
            "draws": 1,
            "losses": 0,
            "goals_for": 3,
            "goals_against": 1,
            "goal_difference": 2,
            "matches_played": 2,
        },
    }

    get_cache = mocker.patch.object(
        teams_service.cache_service,
        "get_cache",
        return_value=cached,
    )
    get_tournament = mocker.patch.object(
        teams_service.tournaments_service,
        "get_tournament",
    )
    get_registration = mocker.patch.object(
        teams_service.tournament_teams_service,
        "get_tournament_team",
    )
    get_standing = mocker.patch.object(
        teams_service.standings_repo,
        "get_standings_for_team",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_profile(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamProfileResponse)
    assert result.team.id == 32
    assert result.team.name == "Canada"
    assert result.group == "B"
    assert result.standing is not None
    assert result.standing.points == 4
    assert result.standing.goal_difference == 2
    assert result.standing.matches_played == 2

    get_cache.assert_called_once_with(db, "team_profile:1:32")
    get_tournament.assert_not_called()
    get_registration.assert_not_called()
    get_standing.assert_not_called()
    set_cache.assert_not_called()


def test_get_team_profile_builds_response_from_registration_and_standing_then_caches(mocker):
    db = Mock()
    tournament = Mock()
    registration = make_registration()
    standing = make_standing()
    ttl = timedelta(minutes=5)
    expires_at = Mock(name="expires_at")
    encoded_payload = {"encoded": True}

    mocker.patch.object(
        teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        teams_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    get_registration = mocker.patch.object(
        teams_service.tournament_teams_service,
        "get_tournament_team",
        return_value=registration,
    )
    get_standing = mocker.patch.object(
        teams_service.standings_repo,
        "get_standings_for_team",
        return_value=standing,
    )
    get_ttl = mocker.patch(
        "app.api.v1.services.teams.get_team_profile_ttl",
        return_value=ttl,
    )
    get_expires_at = mocker.patch(
        "app.api.v1.services.teams.get_expires_at",
        return_value=expires_at,
    )
    jsonable_encoder = mocker.patch(
        "app.api.v1.services.teams.jsonable_encoder",
        return_value=encoded_payload,
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_profile(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamProfileResponse)
    assert result.team.id == 32
    assert result.team.name == "Canada"
    assert result.group == "B"
    assert result.standing is not None
    assert result.standing.position == 1
    assert result.standing.points == 4
    assert result.standing.goal_difference == 2
    assert result.standing.matches_played == 2

    get_tournament.assert_called_once_with(db, 1)
    get_registration.assert_called_once_with(db, 1, 32)
    get_standing.assert_called_once_with(db, 1, 32)
    get_ttl.assert_called_once_with(tournament)
    get_expires_at.assert_called_once_with(ttl)
    jsonable_encoder.assert_called_once_with(result)
    set_cache.assert_called_once_with(
        db,
        "team_profile:1:32",
        payload=encoded_payload,
        expires_at=expires_at,
    )


def test_get_team_profile_returns_none_standing_when_standing_missing_and_caches(mocker):
    db = Mock()
    tournament = Mock()
    registration = make_registration(group="B")
    ttl = timedelta(minutes=5)
    expires_at = Mock(name="expires_at")

    mocker.patch.object(
        teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        teams_service.tournaments_service,
        "get_tournament",
        return_value=tournament,
    )
    mocker.patch.object(
        teams_service.tournament_teams_service,
        "get_tournament_team",
        return_value=registration,
    )
    get_standing = mocker.patch.object(
        teams_service.standings_repo,
        "get_standings_for_team",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.teams.get_team_profile_ttl",
        return_value=ttl,
    )
    mocker.patch(
        "app.api.v1.services.teams.get_expires_at",
        return_value=expires_at,
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_profile(db, tournament_id=1, team_id=32)

    assert result.team.id == 32
    assert result.group == "B"
    assert result.standing is None

    get_standing.assert_called_once_with(db, 1, 32)
    set_cache.assert_called_once()


def test_get_team_profile_preserves_null_group_when_registration_has_no_group(mocker):
    db = Mock()

    mocker.patch.object(
        teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        teams_service.tournaments_service,
        "get_tournament",
        return_value=Mock(),
    )
    mocker.patch.object(
        teams_service.tournament_teams_service,
        "get_tournament_team",
        return_value=make_registration(group=None),
    )
    mocker.patch.object(
        teams_service.standings_repo,
        "get_standings_for_team",
        return_value=None,
    )
    mocker.patch(
        "app.api.v1.services.teams.get_team_profile_ttl",
        return_value=timedelta(minutes=5),
    )
    mocker.patch(
        "app.api.v1.services.teams.get_expires_at",
        return_value=Mock(),
    )
    mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_profile(db, tournament_id=1, team_id=32)

    assert result.group is None
    assert result.standing is None


def test_get_team_profile_does_not_fetch_registration_when_tournament_lookup_fails(mocker):
    db = Mock()

    mocker.patch.object(
        teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    get_tournament = mocker.patch.object(
        teams_service.tournaments_service,
        "get_tournament",
        side_effect=NotFoundError("Tournament 1 not found"),
    )
    get_registration = mocker.patch.object(
        teams_service.tournament_teams_service,
        "get_tournament_team",
    )
    get_standing = mocker.patch.object(
        teams_service.standings_repo,
        "get_standings_for_team",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="Tournament 1 not found"):
        teams_service.get_team_profile(db, tournament_id=1, team_id=32)

    get_tournament.assert_called_once_with(db, 1)
    get_registration.assert_not_called()
    get_standing.assert_not_called()
    set_cache.assert_not_called()


def test_get_team_profile_does_not_fetch_standing_when_registration_lookup_fails(mocker):
    db = Mock()

    mocker.patch.object(
        teams_service.cache_service,
        "get_cache",
        return_value=None,
    )
    mocker.patch.object(
        teams_service.tournaments_service,
        "get_tournament",
        return_value=Mock(),
    )
    get_registration = mocker.patch.object(
        teams_service.tournament_teams_service,
        "get_tournament_team",
        side_effect=NotFoundError("Team 32 not found in tournament 1"),
    )
    get_standing = mocker.patch.object(
        teams_service.standings_repo,
        "get_standings_for_team",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="Team 32 not found in tournament 1"):
        teams_service.get_team_profile(db, tournament_id=1, team_id=32)

    get_registration.assert_called_once_with(db, 1, 32)
    get_standing.assert_not_called()
    set_cache.assert_not_called()
