from datetime import timedelta

# STANDINGS

STANDINGS_TTL = timedelta(minutes=5)  # GitHub cron floor
STANDINGS_PRE_TOURNAMENT_SOON_TTL = timedelta(minutes=15)
STANDINGS_PRE_TOURNAMENT_FAR_TTL = timedelta(days=1)
STANDINGS_FINISHED_TOURNAMENT_TTL = timedelta(days=1)

# MATCHES

MATCHES_PRE_TOURNAMENT_TTL = timedelta(days=1)

MATCHES_SOON_SCHEDULED_TTL = timedelta(minutes=15)
MATCHES_FAR_SCHEDULED_TTL = timedelta(hours=12)

MATCHES_LIVE_TTL = timedelta(minutes=5)

MATCHES_POSTPONED_TTL = timedelta(hours=1)
MATCHES_CANCELLED_TTL = timedelta(days=1)

MATCHES_FINISHED_TTL = timedelta(days=1)

MATCHES_EMPTY_TTL = timedelta(hours=1)
MATCHES_DEFAULT_TTL = timedelta(minutes=30)
