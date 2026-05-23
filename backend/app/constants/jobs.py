import enum


# fixed set of refresh job names
class JobName(str, enum.Enum):
    STANDINGS_REFRESH = "standings_refresh"
    MATCHES_REFRESH = "matches_refresh"
    PLAYER_STATS_REFRESH = "player_stats_refresh"
