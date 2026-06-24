from datetime import date, datetime, timedelta, timezone

from app.api.v1.services.brackets import get_bracket
from app.models.cache_entry import CacheEntry
from app.models.enums import StageType, StatusType
from app.models.match import Match
from app.models.team import Team, TeamType
from app.models.tournament import Tournament


def make_tournament() -> Tournament:
    return Tournament(
        external_api_id=1,
        name="FIFA World Cup",
        season="2026",
        logo_url=None,
        start_date=date(2026, 6, 11),
        end_date=date(2026, 7, 19),
    )


def make_team(
    *,
    external_api_id: int,
    name: str,
    short_name: str,
) -> Team:
    return Team(
        external_api_id=external_api_id,
        name=name,
        short_name=short_name,
        type=TeamType.NATIONAL,
        logo_url=f"https://example.com/{short_name.lower()}.png",
        country=name,
    )


def make_match(
    *,
    external_api_id: int,
    tournament_id: int,
    team_a_id: int,
    team_b_id: int,
    kickoff_time: datetime,
    stage: StageType,
    status: StatusType = StatusType.SCHEDULED,
) -> Match:
    return Match(
        external_api_id=external_api_id,
        tournament_id=tournament_id,
        team_a_id=team_a_id,
        team_b_id=team_b_id,
        kickoff_time=kickoff_time,
        stage=stage,
        group=None if stage != StageType.GROUP else "A",
        status=status,
        venue="MetLife Stadium",
        city="New York",
        elapsed=None,
        team_a_score=None,
        team_b_score=None,
        team_a_penalties=None,
        team_b_penalties=None,
    )


def test_get_bracket_builds_grouped_response_from_stored_matches_and_writes_cache(db_session):
    tournament = make_tournament()
    france = make_team(external_api_id=10, name="France", short_name="FRA")
    argentina = make_team(external_api_id=20, name="Argentina", short_name="ARG")
    brazil = make_team(external_api_id=30, name="Brazil", short_name="BRA")
    germany = make_team(external_api_id=40, name="Germany", short_name="GER")

    db_session.add_all([tournament, france, argentina, brazil, germany])
    db_session.flush()

    db_session.add_all(
        [
            make_match(
                external_api_id=1001,
                tournament_id=tournament.id,
                team_a_id=france.id,
                team_b_id=argentina.id,
                kickoff_time=datetime(2026, 7, 9, 20, 0, tzinfo=timezone.utc),
                stage=StageType.SEMI_FINAL,
                status=StatusType.FINISHED,
            ),
            make_match(
                external_api_id=1002,
                tournament_id=tournament.id,
                team_a_id=brazil.id,
                team_b_id=germany.id,
                kickoff_time=datetime(2026, 7, 19, 20, 0, tzinfo=timezone.utc),
                stage=StageType.FINAL,
                status=StatusType.SCHEDULED,
            ),
            make_match(
                external_api_id=1003,
                tournament_id=tournament.id,
                team_a_id=france.id,
                team_b_id=brazil.id,
                kickoff_time=datetime(2026, 6, 12, 20, 0, tzinfo=timezone.utc),
                stage=StageType.GROUP,
                status=StatusType.FINISHED,
            ),
        ]
    )
    db_session.commit()

    bracket = get_bracket(db_session, tournament.id)

    assert bracket.round_of_32 == []
    assert bracket.round_of_16 == []
    assert bracket.quarter_final == []
    assert bracket.third_place == []

    assert len(bracket.semi_final) == 1
    assert bracket.semi_final[0].id is not None
    assert bracket.semi_final[0].stage == StageType.SEMI_FINAL
    assert bracket.semi_final[0].team_a.short_name == "FRA"
    assert bracket.semi_final[0].team_b.short_name == "ARG"

    assert len(bracket.final) == 1
    assert bracket.final[0].stage == StageType.FINAL
    assert bracket.final[0].team_a.short_name == "BRA"
    assert bracket.final[0].team_b.short_name == "GER"

    cache = db_session.query(CacheEntry).filter_by(cache_key=f"bracket:{tournament.id}").one()

    assert cache.payload is not None
    assert cache.expires_at is not None


def test_get_bracket_returns_cached_payload_when_cache_exists(db_session):
    tournament = make_tournament()
    db_session.add(tournament)
    db_session.flush()

    now = datetime.now(timezone.utc)

    db_session.add(
        CacheEntry(
            cache_key=f"bracket:{tournament.id}",
            payload="""
            {
              "round_of_32": [],
              "round_of_16": [],
              "quarter_final": [],
              "semi_final": [],
              "third_place": [],
              "final": [
                {
                  "id": 999,
                  "team_a": {
                    "id": 1,
                    "name": "Cached France",
                    "short_name": "FRA",
                    "logo_url": null
                  },
                  "team_b": {
                    "id": 2,
                    "name": "Cached Argentina",
                    "short_name": "ARG",
                    "logo_url": null
                  },
                  "kickoff_time": "2026-07-19T20:00:00Z",
                  "stage": "final",
                  "group": null,
                  "status": "scheduled",
                  "venue": "Cached Venue",
                  "city": "Cached City",
                  "elapsed": null,
                  "team_a_score": null,
                  "team_b_score": null,
                  "team_a_penalties": null,
                  "team_b_penalties": null
                }
              ]
            }
            """,
            last_updated=now,
            expires_at=now + timedelta(hours=1),
        )
    )
    db_session.commit()

    bracket = get_bracket(db_session, tournament.id)

    assert bracket.final[0].id == 999
    assert bracket.final[0].team_a.name == "Cached France"
    assert bracket.final[0].team_b.name == "Cached Argentina"
    assert bracket.final[0].venue == "Cached Venue"
    assert bracket.semi_final == []
