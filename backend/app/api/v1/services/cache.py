import json
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.api.v1.repositories import cache as cache_repo


def get_cache(db: Session, key: str) -> dict | None:
    entry = cache_repo.get_cache_entry(db, key)

    if not entry or entry.expires_at < datetime.now(UTC):
        return None

    return json.loads(entry.payload)


def set_cache(db: Session, key: str, payload: dict, expires_at: datetime) -> None:
    cache_repo.set_cache_entry(db, key, json.dumps(payload), expires_at)


def invalidate_cache(db: Session, key: str) -> None:
    cache_repo.invalidate_cache_entry(db, key)