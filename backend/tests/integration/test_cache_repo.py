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
