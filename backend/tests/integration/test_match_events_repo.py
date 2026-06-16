from datetime import datetime, timezone

from app.api.v1.repositories import match_events as match_events_repo
from app.models.enums import StatusType
from app.models.match import Match, StageType
from app.models.match_event import EventType, MatchEvent
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


def test_get_all_match_events_returns_events_in_chronological_order(db_session):
    tournament = Tournament(
        external_api_id=9,
        name="Copa America",
        season="2024",
        start_date=datetime(2024, 6, 21, tzinfo=timezone.utc).date(),
        end_date=datetime(2024, 7, 15, tzinfo=timezone.utc).date(),
    )

    team_a = Team(
        external_api_id=5529,
        name="Canada",
        short_name="CAN",
        type=TeamType.NATIONAL,
        country="Canada",
    )

    team_b = Team(
        external_api_id=7,
        name="Uruguay",
        short_name="URU",
        type=TeamType.NATIONAL,
        country="Uruguay",
    )

    db_session.add_all([tournament, team_a, team_b])
    db_session.commit()

    match = Match(
        external_api_id=1234029,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2024, 7, 14, 0, 0, tzinfo=timezone.utc),
        stage=StageType.THIRD_PLACE,
        group=None,
        status=StatusType.FINISHED,
        venue="Bank of America Stadium",
        city="Charlotte",
        elapsed=120,
        team_a_score=2,
        team_b_score=2,
        team_a_penalties=3,
        team_b_penalties=4,
    )

    db_session.add(match)
    db_session.commit()

    late_event = MatchEvent(
        match_id=match.id,
        team_id=team_b.id,
        player_name="L. Suárez",
        player_external_id=157,
        event_type=EventType.GOAL,
        minute=90,
        extra_minute=2,
        detail="Normal Goal",
        comments=None,
    )

    first_penalty = MatchEvent(
        match_id=match.id,
        team_id=team_a.id,
        player_name="J. David",
        player_external_id=8489,
        event_type=EventType.PENALTY_GOAL,
        minute=120,
        extra_minute=1,
        detail="Penalty",
        comments="Penalty Shootout",
    )

    early_card = MatchEvent(
        match_id=match.id,
        team_id=team_a.id,
        player_name="Luc De Fougerolles",
        player_external_id=327738,
        event_type=EventType.YELLOW_CARD,
        minute=7,
        extra_minute=None,
        detail="Yellow Card",
        comments="Foul",
    )

    same_minute_goal = MatchEvent(
        match_id=match.id,
        team_id=team_b.id,
        player_name="R. Bentancur",
        secondary_player_name="S. Cáceres",
        player_external_id=863,
        secondary_player_external_id=51535,
        event_type=EventType.GOAL,
        minute=8,
        extra_minute=None,
        detail="Normal Goal",
        comments=None,
    )

    db_session.add_all(
        [
            late_event,
            first_penalty,
            early_card,
            same_minute_goal,
        ]
    )
    db_session.commit()

    rows = match_events_repo.get_all_match_events(db_session, match.id)

    assert [row.id for row in rows] == [
        early_card.id,
        same_minute_goal.id,
        late_event.id,
        first_penalty.id,
    ]

    assert rows[0].team.name == "Canada"
    assert rows[1].team.name == "Uruguay"
    assert rows[1].player_name == "R. Bentancur"
    assert rows[1].secondary_player_name == "S. Cáceres"
    assert rows[3].comments == "Penalty Shootout"


def test_get_all_match_events_returns_empty_list_when_match_has_no_events(
    db_session,
):
    tournament = Tournament(
        external_api_id=9,
        name="Copa America",
        season="2024",
        start_date=datetime(2024, 6, 21, tzinfo=timezone.utc).date(),
        end_date=datetime(2024, 7, 15, tzinfo=timezone.utc).date(),
    )

    team_a = Team(
        external_api_id=5529,
        name="Canada",
        short_name="CAN",
        type=TeamType.NATIONAL,
        country="Canada",
    )

    team_b = Team(
        external_api_id=7,
        name="Uruguay",
        short_name="URU",
        type=TeamType.NATIONAL,
        country="Uruguay",
    )

    db_session.add_all([tournament, team_a, team_b])
    db_session.commit()

    match = Match(
        external_api_id=1234029,
        tournament_id=tournament.id,
        team_a_id=team_a.id,
        team_b_id=team_b.id,
        kickoff_time=datetime(2024, 7, 14, 0, 0, tzinfo=timezone.utc),
        stage=StageType.THIRD_PLACE,
        group=None,
        status=StatusType.SCHEDULED,
    )

    db_session.add(match)
    db_session.commit()

    rows = match_events_repo.get_all_match_events(db_session, match.id)

    assert rows == []
