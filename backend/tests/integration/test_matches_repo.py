from datetime import date, datetime, timezone

import pytest

from app.api.v1.repositories import matches as matches_repo
from app.models.match import Match, StageType, StatusType
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
