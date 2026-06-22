from datetime import timedelta

# STANDINGS

STANDINGS_TTL = timedelta(hours=1)  # API-Football standings refresh hourly
STANDINGS_PRE_TOURNAMENT_SOON_TTL = timedelta(hours=1)
STANDINGS_PRE_TOURNAMENT_FAR_TTL = timedelta(days=1)
STANDINGS_FINISHED_TOURNAMENT_TTL = timedelta(days=7)

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


# MATCH EVENTS

MATCH_EVENTS_LIVE_KNOCKOUT_TTL = timedelta(minutes=1)
MATCH_EVENTS_LIVE_GROUP_TTL = timedelta(minutes=1)

MATCH_EVENTS_SOON_SCHEDULED_TTL = timedelta(minutes=5)
MATCH_EVENTS_FAR_SCHEDULED_TTL = timedelta(hours=12)

MATCH_EVENTS_FINISHED_TTL = timedelta(days=1)

MATCH_EVENTS_DEFAULT_TTL = timedelta(minutes=5)


# TEAMS

TEAMS_PRE_TOURNAMENT_SOON_TTL = timedelta(hours=1)
TEAMS_PRE_TOURNAMENT_FAR_TTL = timedelta(days=1)
TEAMS_GROUP_STAGE_TTL = timedelta(days=1)
TEAMS_KNOCKOUT_TTL = timedelta(hours=1)
TEAMS_FINISHED_TTL = timedelta(days=7)

# TEAM PROFILE

TOURNAMENT_DATA_PRE_TOURNAMENT_SOON_TTL = timedelta(hours=1)
TOURNAMENT_DATA_PRE_TOURNAMENT_FAR_TTL = timedelta(days=1)
TOURNAMENT_DATA_ACTIVE_TTL = timedelta(minutes=15)
TOURNAMENT_DATA_FINISHED_TTL = timedelta(days=7)
