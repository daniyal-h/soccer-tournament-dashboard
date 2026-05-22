from datetime import date

import pytest

from app.models.standing import Standing
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.tournament_team import TournamentTeam


@pytest.fixture
def seeded_refresh_tournament(db_session):
    tournament = Tournament(
        id=10,
        external_api_id=1,
        name="Refresh Test Cup",
        season="2022",
        start_date=date(2022, 11, 20),
        end_date=date(2022, 12, 18),
    )
    db_session.add(tournament)
    db_session.flush()

    db_session.add_all(
        [
            Team(
                id=10,
                external_api_id=501,
                name="Team X",
                short_name="TMX",
                type="national",
                country="Country X",
            ),
            Team(
                id=11,
                external_api_id=502,
                name="Team Y",
                short_name="TMY",
                type="national",
                country="Country Y",
            ),
        ]
    )
    db_session.flush()

    db_session.add_all(
        [
            TournamentTeam(tournament_id=10, team_id=10, group="A"),
            TournamentTeam(tournament_id=10, team_id=11, group="A"),
        ]
    )

    # seed stale standings to be replaced
    db_session.add_all(
        [
            Standing(
                tournament_id=10,
                team_id=10,
                group="A",
                position=1,
                points=0,
                wins=0,
                draws=0,
                losses=0,
                goals_for=0,
                goals_against=0,
            ),
            Standing(
                tournament_id=10,
                team_id=11,
                group="A",
                position=2,
                points=0,
                wins=0,
                draws=0,
                losses=0,
                goals_for=0,
                goals_against=0,
            ),
        ]
    )
    db_session.commit()


def test_refresh_standings_updates_db(client, db_session, seeded_refresh_tournament):
    payload = [
        {
            "external_team_id": 501,
            "group": "A",
            "position": 1,
            "points": 9,
            "wins": 3,
            "draws": 0,
            "losses": 0,
            "goals_for": 7,
            "goals_against": 1,
        },
        {
            "external_team_id": 502,
            "group": "A",
            "position": 2,
            "points": 3,
            "wins": 1,
            "draws": 0,
            "losses": 2,
            "goals_for": 2,
            "goals_against": 5,
        },
    ]

    response = client.put(
        "/api/v1/admin/standings/10", json=payload, headers={"Authorization": "Bearer test_token"}
    )
    assert response.status_code == 200

    rows = db_session.query(Standing).where(Standing.tournament_id == 10).all()
    assert len(rows) == 2

    team_x = next(r for r in rows if r.team_id == 10)
    assert team_x.points == 9
    assert team_x.goals_for == 7


def test_refresh_standings_invalidates_cache(client, db_session, seeded_refresh_tournament):
    import json
    from datetime import UTC, datetime, timedelta

    from app.models.cache_entry import CacheEntry

    # seed a stale cache entry
    db_session.add(
        CacheEntry(
            cache_key="standings:10",
            payload=json.dumps({"A": []}),
            last_updated=datetime.now(UTC),
            expires_at=datetime.now(UTC) + timedelta(hours=1),
        )
    )
    db_session.commit()

    payload = [
        {
            "external_team_id": 501,
            "group": "A",
            "position": 1,
            "points": 9,
            "wins": 3,
            "draws": 0,
            "losses": 0,
            "goals_for": 7,
            "goals_against": 1,
        },
    ]

    client.put(
        "/api/v1/admin/standings/10", json=payload, headers={"Authorization": "Bearer test_token"}
    )

    cache_entry = db_session.query(CacheEntry).where(CacheEntry.cache_key == "standings:10").first()
    assert cache_entry is None


def test_refresh_standings_rejects_invalid_token(client, seeded_refresh_tournament):
    response = client.put(
        "/api/v1/admin/standings/10",
        json=[],
        headers={"Authorization": "Bearer wrong_token"},
    )
    assert response.status_code == 403
