from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.cache_entry import CacheEntry


def get_cache_entry(db: Session, key: str) -> CacheEntry | None:
    return db.query(CacheEntry).where(CacheEntry.cache_key == key).first()


def set_cache_entry(db: Session, key: str, payload: str, expires_at: datetime) -> None:
    now = datetime.now(UTC)
    existing = db.query(CacheEntry).where(CacheEntry.cache_key == key).first()

    # if a cache entry exists, update it, otherwise, add a new one
    if existing:
        existing.payload = payload
        existing.last_updated = now
        existing.expires_at = expires_at
    else:
        db.add(
            CacheEntry(
                cache_key=key,
                payload=payload,
                last_updated=now,
                expires_at=expires_at,
            )
        )

    db.commit()


def invalidate_cache_entry(db: Session, key: str) -> None:
    db.query(CacheEntry).where(CacheEntry.cache_key == key).delete()
    db.commit()
