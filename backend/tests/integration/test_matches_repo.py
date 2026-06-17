from datetime import date, datetime, timezone

import pytest

from app.api.v1.repositories import matches as matches_repo
from app.models.enums import StageType, StatusType
from app.models.match import Match
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


@pytest.fixture
def tournament_and_teams(db_session):
    tournament = Tournament(
        external_api_id=1,
        name="FIFA World Cup",
        season="2026",
        logo_url=None,
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )

    team_a = Team(
        external_api_id=10,
        name="Canada",
        short_name="CAN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Canada",
    )

    team_b = Team(
        external_api_id=20,
        name="United States",
        short_name="USA",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="United States",
    )

    db_session.add_all([tournament, team_a, team_b])
    db_session.commit()

    return tournament, team_a, team_b


def test_upsert_matches_in_tournament_inserts_new_match(db_session, tournament_and_teams):
    tournament, team_a, team_b = tournament_and_teams

    row = Match(
        external_api_id=9001,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="BC Place",
        city="Vancouver",
    )

    matches_repo.upsert_matches_in_tournament(db_session, tournament.id, [row])

    saved = db_session.query(Match).filter_by(external_api_id=9001).one()

    assert saved.tournament_id == tournament.id
    assert saved.team_a_id == team_a.id
    assert saved.team_b_id == team_b.id
    assert saved.group == "A"
    assert saved.status == StatusType.SCHEDULED
    assert saved.venue == "BC Place"
    assert saved.city == "Vancouver"


def test_upsert_matches_in_tournament_updates_existing_match_without_duplicate(
    db_session,
    tournament_and_teams,
):
    tournament, team_a, team_b = tournament_and_teams

    existing = Match(
        external_api_id=9001,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Old Venue",
        city="Old City",
        team_a_score=None,
        team_b_score=None,
    )
    db_session.add(existing)
    db_session.commit()

    existing_id = existing.id

    updated = Match(
        external_api_id=9001,
        tournament_id=tournament.id,
        team_a_id=team_b.id,
        team_b_id=team_a.id,
        kickoff_time=datetime(2026, 6, 12, 21, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="B",
        status=StatusType.FINISHED,
        venue="New Venue",
        city="New City",
        elapsed=90,
        team_a_score=2,
        team_b_score=1,
    )

    matches_repo.upsert_matches_in_tournament(db_session, tournament.id, [updated])

    rows = db_session.query(Match).filter_by(external_api_id=9001).all()

    assert len(rows) == 1
    assert rows[0].id == existing_id
    assert rows[0].tournament_id == tournament.id
    assert rows[0].team_a_id == team_b.id
    assert rows[0].team_b_id == team_a.id
    assert rows[0].kickoff_time == updated.kickoff_time
    assert rows[0].group == "B"
    assert rows[0].status == StatusType.FINISHED
    assert rows[0].venue == "New Venue"
    assert rows[0].city == "New City"
    assert rows[0].elapsed == 90
    assert rows[0].team_a_score == 2
    assert rows[0].team_b_score == 1


def test_get_team_matches_by_tournament_returns_matches_where_team_is_team_a_or_team_b(
    db_session,
    tournament_and_teams,
):
    tournament, team_a, team_b = tournament_and_teams

    team_c = Team(
        external_api_id=30,
        name="Mexico",
        short_name="MEX",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Mexico",
    )
    db_session.add(team_c)
    db_session.commit()

    team_a_home = Match(
        external_api_id=9101,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.FINISHED,
        venue="Venue A",
        city="Vancouver",
        team_a_score=2,
        team_b_score=1,
    )
    team_a_away = Match(
        external_api_id=9102,
        tournament_id=tournament.id,
        team_a_id=team_c.id,
        team_b_id=team_a.id,
        kickoff_time=datetime(2026, 6, 15, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Venue B",
        city="Toronto",
    )
    unrelated = Match(
        external_api_id=9103,
        tournament_id=tournament.id,
        team_a_id=team_b.id,
        team_b_id=team_c.id,
        kickoff_time=datetime(2026, 6, 13, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.FINISHED,
        venue="Venue C",
        city="Montreal",
        team_a_score=0,
        team_b_score=0,
    )

    db_session.add_all([team_a_home, team_a_away, unrelated])
    db_session.commit()

    rows = matches_repo.get_team_matches_by_tournament(
        db_session,
        tournament_id=tournament.id,
        team_id=team_a.id,
    )

    assert [match.external_api_id for match in rows] == [9101, 9102]
    assert rows[0].team_a_id == team_a.id
    assert rows[1].team_b_id == team_a.id
    assert 9103 not in [match.external_api_id for match in rows]


def test_get_team_matches_by_tournament_filters_by_tournament(
    db_session,
    tournament_and_teams,
):
    tournament, team_a, team_b = tournament_and_teams

    other_tournament = Tournament(
        external_api_id=2,
        name="Other Cup",
        season="2026",
        logo_url=None,
        start_date=date(2026, 8, 1),
        end_date=date(2026, 8, 31),
    )
    db_session.add(other_tournament)
    db_session.commit()

    target_match = Match(
        external_api_id=9201,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Target Venue",
        city="Vancouver",
    )
    other_tournament_match = Match(
        external_api_id=9202,
        tournament_id=other_tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 8, 1, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Wrong Tournament Venue",
        city="Toronto",
    )

    db_session.add_all([target_match, other_tournament_match])
    db_session.commit()

    rows = matches_repo.get_team_matches_by_tournament(
        db_session,
        tournament_id=tournament.id,
        team_id=team_a.id,
    )

    assert [match.external_api_id for match in rows] == [9201]
    assert {match.tournament_id for match in rows} == {tournament.id}


def test_get_team_matches_by_tournament_orders_by_kickoff_time_ascending(
    db_session,
    tournament_and_teams,
):
    tournament, team_a, team_b = tournament_and_teams

    early = Match(
        external_api_id=9301,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 6, 11, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Early Venue",
        city="Vancouver",
    )
    late = Match(
        external_api_id=9302,
        tournament_id=tournament.id,
        team_a_id=team_b.id,
        team_b_id=team_a.id,
        kickoff_time=datetime(2026, 6, 20, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Late Venue",
        city="Toronto",
    )
    middle = Match(
        external_api_id=9303,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2026, 6, 15, 20, 0, tzinfo=timezone.utc),
        stage=StageType.GROUP,
        group="A",
        status=StatusType.SCHEDULED,
        venue="Middle Venue",
        city="Montreal",
    )

    db_session.add_all([late, early, middle])
    db_session.commit()

    rows = matches_repo.get_team_matches_by_tournament(
        db_session,
        tournament_id=tournament.id,
        team_id=team_a.id,
    )

    assert [match.external_api_id for match in rows] == [9301, 9303, 9302]
    assert [match.kickoff_time for match in rows] == sorted(match.kickoff_time for match in rows)


def test_get_team_matches_by_tournament_returns_empty_list_when_team_has_no_matches(
    db_session,
    tournament_and_teams,
):
    tournament, _, _ = tournament_and_teams

    team_without_matches = Team(
        external_api_id=40,
        name="Japan",
        short_name="JPN",
        type=TeamType.NATIONAL,
        logo_url=None,
        country="Japan",
    )
    db_session.add(team_without_matches)
    db_session.commit()

    rows = matches_repo.get_team_matches_by_tournament(
        db_session,
        tournament_id=tournament.id,
        team_id=team_without_matches.id,
    )

    assert rows == []
