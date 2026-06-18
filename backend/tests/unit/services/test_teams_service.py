from datetime import timedelta
from types import SimpleNamespace
from unittest.mock import Mock

import pytest

from app.api.v1.services import teams as teams_service
from app.schemas.errors import NotFoundError
from app.schemas.teams import TeamMatchesResponse, TeamProfileResponse, TeamSquadResponse


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


def make_match(match_id=100):
    team_a = SimpleNamespace(
        id=32,
        name="Canada",
        short_name="CAN",
        logo_url="https://example.com/canada.png",
    )
    team_b = SimpleNamespace(
        id=55,
        name="Brazil",
        short_name="BRA",
        logo_url="https://example.com/brazil.png",
    )

    return SimpleNamespace(
        id=match_id,
        team_a=team_a,
        team_b=team_b,
        kickoff_time="2026-06-12T20:00:00Z",
        stage="group",
        group="B",
        status="scheduled",
        venue="BC Place",
        city="Vancouver",
        elapsed=None,
        team_a_score=None,
        team_b_score=None,
        team_a_penalties=None,
        team_b_penalties=None,
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


def test_get_team_matches_returns_cached_response_without_repo_calls(mocker):
    db = Mock()
    cached = {
        "data": [
            {
                "id": 100,
                "team_a": {
                    "id": 32,
                    "name": "Canada",
                    "short_name": "CAN",
                    "logo_url": "https://example.com/canada.png",
                },
                "team_b": {
                    "id": 55,
                    "name": "Brazil",
                    "short_name": "BRA",
                    "logo_url": "https://example.com/brazil.png",
                },
                "kickoff_time": "2026-06-12T20:00:00Z",
                "stage": "group",
                "group": "B",
                "status": "scheduled",
                "venue": "BC Place",
                "city": "Vancouver",
                "elapsed": None,
                "team_a_score": None,
                "team_b_score": None,
                "team_a_penalties": None,
                "team_b_penalties": None,
            }
        ]
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_matches = mocker.patch.object(
        teams_service.matches_repo,
        "get_team_matches_by_tournament",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_matches(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamMatchesResponse)
    assert len(result.data) == 1
    assert result.data[0].id == 100
    assert result.data[0].team_a.id == 32
    assert result.data[0].team_b.name == "Brazil"
    assert result.data[0].status == "scheduled"

    get_cache.assert_called_once_with(db, "team_matches:1:32")
    get_tournament.assert_not_called()
    validate_team.assert_not_called()
    get_matches.assert_not_called()
    set_cache.assert_not_called()


def test_get_team_matches_fetches_matches_then_caches_response(mocker):
    db = Mock()
    tournament = Mock()
    matches = [make_match(match_id=100), make_match(match_id=101)]
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_matches = mocker.patch.object(
        teams_service.matches_repo,
        "get_team_matches_by_tournament",
        return_value=matches,
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

    result = teams_service.get_team_matches(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamMatchesResponse)
    assert len(result.data) == 2
    assert result.data[0].id == 100
    assert result.data[1].id == 101

    get_tournament.assert_called_once_with(db, 1)
    validate_team.assert_called_once_with(db, 1, 32)
    get_matches.assert_called_once_with(db, 1, 32)
    get_ttl.assert_called_once_with(tournament)
    get_expires_at.assert_called_once_with(ttl)
    jsonable_encoder.assert_called_once_with(result)
    set_cache.assert_called_once_with(
        db,
        "team_matches:1:32",
        payload=encoded_payload,
        expires_at=expires_at,
    )


def test_get_team_matches_caches_empty_list_for_valid_team_with_no_matches(mocker):
    db = Mock()
    tournament = Mock()
    ttl = timedelta(minutes=5)
    expires_at = Mock(name="expires_at")
    encoded_payload = {"data": []}

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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_matches = mocker.patch.object(
        teams_service.matches_repo,
        "get_team_matches_by_tournament",
        return_value=[],
    )
    mocker.patch(
        "app.api.v1.services.teams.get_team_profile_ttl",
        return_value=ttl,
    )
    mocker.patch(
        "app.api.v1.services.teams.get_expires_at",
        return_value=expires_at,
    )
    mocker.patch(
        "app.api.v1.services.teams.jsonable_encoder",
        return_value=encoded_payload,
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_matches(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamMatchesResponse)
    assert result.data == []

    validate_team.assert_called_once_with(db, 1, 32)
    get_matches.assert_called_once_with(db, 1, 32)
    set_cache.assert_called_once_with(
        db,
        "team_matches:1:32",
        payload=encoded_payload,
        expires_at=expires_at,
    )


def test_get_team_matches_does_not_validate_team_when_tournament_lookup_fails(mocker):
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_matches = mocker.patch.object(
        teams_service.matches_repo,
        "get_team_matches_by_tournament",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="Tournament 1 not found"):
        teams_service.get_team_matches(db, tournament_id=1, team_id=32)

    get_tournament.assert_called_once_with(db, 1)
    validate_team.assert_not_called()
    get_matches.assert_not_called()
    set_cache.assert_not_called()


def test_get_team_matches_does_not_fetch_matches_when_team_validation_fails(mocker):
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
        side_effect=NotFoundError("Team 32 not found in tournament 1"),
    )
    get_matches = mocker.patch.object(
        teams_service.matches_repo,
        "get_team_matches_by_tournament",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="Team 32 not found in tournament 1"):
        teams_service.get_team_matches(db, tournament_id=1, team_id=32)

    validate_team.assert_called_once_with(db, 1, 32)
    get_matches.assert_not_called()
    set_cache.assert_not_called()


def make_player(player_id=10):
    return SimpleNamespace(
        id=player_id,
        display_name="Alphonso Davies",
        first_name="Alphonso",
        last_name="Davies",
        photo_url="https://example.com/davies.png",
        nationality="Canada",
        date_of_birth="2000-11-02",
        height=183,
    )


def make_squad_player(player_id=10, squad_number=19, position="DEF"):
    return SimpleNamespace(
        player=make_player(player_id=player_id),
        squad_number=squad_number,
        position=position,
    )


def test_get_team_squad_returns_cached_response_without_repo_calls(mocker):
    db = Mock()
    cached = {
        "data": [
            {
                "player": {
                    "id": 10,
                    "display_name": "Alphonso Davies",
                    "first_name": "Alphonso",
                    "last_name": "Davies",
                    "photo_url": "https://example.com/davies.png",
                    "nationality": "Canada",
                    "date_of_birth": "2000-11-02",
                    "height": 183,
                },
                "squad_number": 19,
                "position": "DEF",
            }
        ]
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_squad = mocker.patch.object(
        teams_service.team_players_repo,
        "get_team_squad_by_tournament",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_squad(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamSquadResponse)
    assert len(result.data) == 1
    assert result.data[0].player.id == 10
    assert result.data[0].player.display_name == "Alphonso Davies"
    assert result.data[0].player.first_name == "Alphonso"
    assert result.data[0].player.last_name == "Davies"
    assert result.data[0].player.nationality == "Canada"
    assert result.data[0].player.date_of_birth.isoformat() == "2000-11-02"
    assert result.data[0].player.height == 183
    assert result.data[0].squad_number == 19
    assert result.data[0].position == "DEF"

    get_cache.assert_called_once_with(db, "team_squad:1:32")
    get_tournament.assert_not_called()
    validate_team.assert_not_called()
    get_squad.assert_not_called()
    set_cache.assert_not_called()


def test_get_team_squad_fetches_squad_then_caches_response(mocker):
    db = Mock()
    tournament = Mock()
    squad = [
        make_squad_player(player_id=10, squad_number=19, position="DEF"),
        make_squad_player(player_id=11, squad_number=None, position="MID"),
    ]
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_squad = mocker.patch.object(
        teams_service.team_players_repo,
        "get_team_squad_by_tournament",
        return_value=squad,
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

    result = teams_service.get_team_squad(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamSquadResponse)
    assert len(result.data) == 2
    assert result.data[0].player.id == 10
    assert result.data[0].squad_number == 19
    assert result.data[0].position == "DEF"
    assert result.data[1].player.id == 11
    assert result.data[1].squad_number is None
    assert result.data[1].position == "MID"

    get_tournament.assert_called_once_with(db, 1)
    validate_team.assert_called_once_with(db, 1, 32)
    get_squad.assert_called_once_with(db, 1, 32)
    get_ttl.assert_called_once_with(tournament)
    get_expires_at.assert_called_once_with(ttl)
    jsonable_encoder.assert_called_once_with(result)
    set_cache.assert_called_once_with(
        db,
        "team_squad:1:32",
        payload=encoded_payload,
        expires_at=expires_at,
    )


def test_get_team_squad_caches_empty_list_for_valid_team_with_no_squad(mocker):
    db = Mock()
    tournament = Mock()
    ttl = timedelta(minutes=5)
    expires_at = Mock(name="expires_at")
    encoded_payload = {"data": []}

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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_squad = mocker.patch.object(
        teams_service.team_players_repo,
        "get_team_squad_by_tournament",
        return_value=[],
    )
    mocker.patch(
        "app.api.v1.services.teams.get_team_profile_ttl",
        return_value=ttl,
    )
    mocker.patch(
        "app.api.v1.services.teams.get_expires_at",
        return_value=expires_at,
    )
    mocker.patch(
        "app.api.v1.services.teams.jsonable_encoder",
        return_value=encoded_payload,
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    result = teams_service.get_team_squad(db, tournament_id=1, team_id=32)

    assert isinstance(result, TeamSquadResponse)
    assert result.data == []

    validate_team.assert_called_once_with(db, 1, 32)
    get_squad.assert_called_once_with(db, 1, 32)
    set_cache.assert_called_once_with(
        db,
        "team_squad:1:32",
        payload=encoded_payload,
        expires_at=expires_at,
    )


def test_get_team_squad_does_not_validate_team_when_tournament_lookup_fails(mocker):
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
    )
    get_squad = mocker.patch.object(
        teams_service.team_players_repo,
        "get_team_squad_by_tournament",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="Tournament 1 not found"):
        teams_service.get_team_squad(db, tournament_id=1, team_id=32)

    get_tournament.assert_called_once_with(db, 1)
    validate_team.assert_not_called()
    get_squad.assert_not_called()
    set_cache.assert_not_called()


def test_get_team_squad_does_not_fetch_squad_when_team_validation_fails(mocker):
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
    validate_team = mocker.patch.object(
        teams_service.tournament_teams_service,
        "validate_team_in_tournament",
        side_effect=NotFoundError("Team 32 not found in tournament 1"),
    )
    get_squad = mocker.patch.object(
        teams_service.team_players_repo,
        "get_team_squad_by_tournament",
    )
    set_cache = mocker.patch.object(
        teams_service.cache_service,
        "set_cache",
    )

    with pytest.raises(NotFoundError, match="Team 32 not found in tournament 1"):
        teams_service.get_team_squad(db, tournament_id=1, team_id=32)

    validate_team.assert_called_once_with(db, 1, 32)
    get_squad.assert_not_called()
    set_cache.assert_not_called()
