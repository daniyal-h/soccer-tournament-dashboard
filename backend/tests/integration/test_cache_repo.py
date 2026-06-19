import json
from datetime import UTC, datetime, timedelta

from app.api.v1.repositories import cache as cache_repo
from app.models.cache_entry import CacheEntry


def test_get_cache_entry_returns_none_when_not_found(db_session):
    result = cache_repo.get_cache_entry(db_session, "nonexistent:key")
    assert result is None


def test_get_cache_entry_returns_entry_when_found(db_session):
    now = datetime.now(UTC)
    db_session.add(
        CacheEntry(
            cache_key="standings:1",
            payload=json.dumps({"A": []}),
            last_updated=now,
            expires_at=now + timedelta(minutes=5),
        )
    )
    db_session.commit()

    result = cache_repo.get_cache_entry(db_session, "standings:1")

    assert result is not None
    assert result.cache_key == "standings:1"


def test_set_cache_entry_inserts_new_entry(db_session):
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)

    cache_repo.set_cache_entry(db_session, "standings:1", json.dumps({"A": []}), expires_at)

    result = db_session.query(CacheEntry).where(CacheEntry.cache_key == "standings:1").first()
    assert result is not None
    assert result.expires_at.replace(tzinfo=UTC) == expires_at.replace(tzinfo=UTC)


def test_set_cache_entry_updates_existing_entry(db_session):
    now = datetime.now(UTC)
    db_session.add(
        CacheEntry(
            cache_key="standings:1",
            payload=json.dumps({"A": []}),
            last_updated=now,
            expires_at=now + timedelta(minutes=5),
        )
    )
    db_session.commit()

    new_expires = now + timedelta(minutes=10)
    cache_repo.set_cache_entry(db_session, "standings:1", json.dumps({"B": []}), new_expires)

    result = db_session.query(CacheEntry).where(CacheEntry.cache_key == "standings:1").first()
    assert result is not None
    assert json.loads(result.payload) == {"B": []}
    assert result.expires_at.replace(tzinfo=UTC) == new_expires.replace(tzinfo=UTC)


def test_set_cache_entry_does_not_create_duplicate_for_existing_key(db_session):
    now = datetime.now(UTC)

    cache_repo.set_cache_entry(
        db_session,
        "standings:1",
        json.dumps({"A": []}),
        now + timedelta(minutes=5),
    )

    cache_repo.set_cache_entry(
        db_session,
        "standings:1",
        json.dumps({"B": []}),
        now + timedelta(minutes=10),
    )

    count = db_session.query(CacheEntry).where(CacheEntry.cache_key == "standings:1").count()

    assert count == 1


def test_set_cache_entry_supports_list_payload(db_session):
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)
    payload = json.dumps([{"id": 1}, {"id": 2}])

    cache_repo.set_cache_entry(db_session, "matches:1", payload, expires_at)

    result = db_session.query(CacheEntry).where(CacheEntry.cache_key == "matches:1").first()

    assert result is not None
    assert json.loads(result.payload) == [{"id": 1}, {"id": 2}]
    assert result.expires_at.replace(tzinfo=UTC) == expires_at.replace(tzinfo=UTC)


def test_invalidate_cache_entry_deletes_entry(db_session):
    now = datetime.now(UTC)
    db_session.add(
        CacheEntry(
            cache_key="standings:1",
            payload=json.dumps({"A": []}),
            last_updated=now,
            expires_at=now + timedelta(minutes=5),
        )
    )
    db_session.commit()

    cache_repo.invalidate_cache_entry(db_session, "standings:1")

    result = db_session.query(CacheEntry).where(CacheEntry.cache_key == "standings:1").first()
    assert result is None


def test_invalidate_cache_entry_does_nothing_when_not_found(db_session):
    # should not raise
    cache_repo.invalidate_cache_entry(db_session, "nonexistent:key")


def test_invalidate_cache_prefix_deletes_all_matching_nested_entries(db_session):
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)

    db_session.add_all(
        [
            CacheEntry(
                cache_key="team_squad:1:10",
                payload=json.dumps({"team": 10}),
                last_updated=now,
                expires_at=expires_at,
            ),
            CacheEntry(
                cache_key="team_squad:1:11",
                payload=json.dumps({"team": 11}),
                last_updated=now,
                expires_at=expires_at,
            ),
            CacheEntry(
                cache_key="standings:1",
                payload=json.dumps({"A": []}),
                last_updated=now,
                expires_at=expires_at,
            ),
        ]
    )
    db_session.commit()

    cache_repo.invalidate_cache_prefix(db_session, "team_squad:1:")

    remaining_keys = {
        row.cache_key for row in db_session.query(CacheEntry).order_by(CacheEntry.cache_key).all()
    }

    assert remaining_keys == {"standings:1"}


def test_invalidate_cache_prefix_keeps_similar_tournament_ids_when_delimiter_used(
    db_session,
):
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)

    db_session.add_all(
        [
            CacheEntry(
                cache_key="team_squad:1:10",
                payload=json.dumps({"team": 10}),
                last_updated=now,
                expires_at=expires_at,
            ),
            CacheEntry(
                cache_key="team_squad:10:10",
                payload=json.dumps({"team": 10}),
                last_updated=now,
                expires_at=expires_at,
            ),
            CacheEntry(
                cache_key="team_squad:100:10",
                payload=json.dumps({"team": 10}),
                last_updated=now,
                expires_at=expires_at,
            ),
        ]
    )
    db_session.commit()

    cache_repo.invalidate_cache_prefix(db_session, "team_squad:1:")

    remaining_keys = {
        row.cache_key for row in db_session.query(CacheEntry).order_by(CacheEntry.cache_key).all()
    }

    assert remaining_keys == {"team_squad:10:10", "team_squad:100:10"}


def test_invalidate_cache_prefix_does_nothing_when_no_entries_match(db_session):
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)

    db_session.add(
        CacheEntry(
            cache_key="standings:1",
            payload=json.dumps({"A": []}),
            last_updated=now,
            expires_at=expires_at,
        )
    )
    db_session.commit()

    cache_repo.invalidate_cache_prefix(db_session, "team_squad:1:")

    result = db_session.query(CacheEntry).where(CacheEntry.cache_key == "standings:1").one()

    assert result.payload == json.dumps({"A": []})


def test_invalidate_cache_prefix_commits_delete(db_session):
    now = datetime.now(UTC)
    expires_at = now + timedelta(minutes=5)

    cache_repo.set_cache_entry(
        db_session,
        "team_squad:1:10",
        json.dumps({"team": 10}),
        expires_at,
    )

    cache_repo.invalidate_cache_prefix(db_session, "team_squad:1:")

    result = cache_repo.get_cache_entry(db_session, "team_squad:1:10")

    assert result is None
