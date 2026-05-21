from datetime import UTC, datetime, timedelta


def get_expires_at(ttl: timedelta) -> datetime:
    return datetime.now(UTC) + ttl
