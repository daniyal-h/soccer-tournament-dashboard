import enum


class StatusType(str, enum.Enum):
    SCHEDULED = "scheduled"
    LIVE = "live"
    FINISHED = "finished"
    POSTPONED = "postponed"
    CANCELLED = "cancelled"


class StageType(str, enum.Enum):
    GROUP = "group"
    ROUND_OF_32 = "round_of_32"
    ROUND_OF_16 = "round_of_16"
    QUARTER_FINAL = "quarter_final"
    SEMI_FINAL = "semi_final"
    THIRD_PLACE = "third_place"
    FINAL = "final"
    OTHER = "other"


class EventType(str, enum.Enum):
    GOAL = "goal"
    OWN_GOAL = "own_goal"
    PENALTY_GOAL = "penalty_goal"
    PENALTY_MISS = "penalty_miss"
    YELLOW_CARD = "yellow_card"
    RED_CARD = "red_card"
    SUBSTITUTION = "substitution"
    VAR = "var"
    OTHER = "other"


class JobName(str, enum.Enum):
    STANDINGS_REFRESH = "standings_refresh"
    MATCHES_REFRESH = "matches_refresh"
    MATCH_EVENTS_REFRESH = "match_events_refresh"
    TEAM_RANKINGS_REFRESH = "team_rankings_refresh"
    PLAYER_DATA_REFRESH = "player_data_refresh"


class JobStatus(str, enum.Enum):
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"


class PositionType(str, enum.Enum):
    GK = "GK"
    DEF = "DEF"
    MID = "MID"
    FWD = "FWD"


class LeaderboardType(str, enum.Enum):
    GOALS = "goals"
    ASSISTS = "assists"
    YELLOW_CARDS = "yellow_cards"
