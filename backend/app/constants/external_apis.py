API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"

API_FOOTBALL_STANDINGS_ENDPOINT = "/standings"
API_FOOTBALL_FIXTURES_ENDPOINT = "/fixtures"
API_FOOTBALL_EVENTS_ENDPOINT = "/fixtures/events"
API_FOOTBALL_PLAYERS_ENDPOINT = "/players"
API_FOOTBALL_LEADERBOARD_ENDPOINTS = {
    "goals": "/players/topscorers",
    "assists": "/players/topassists",
    "yellow_cards": "/players/topyellowcards",
}
STANDINGS_MARGIN_DAYS = 1
MATCHES_MARGIN_DAYS = 14
TEAM_SQUADS_MARGIN_DAYS = 1

# codes based on Football-API fixture status can be collapsed into 5 types used in backend

LIVE_STATUS_SHORT_CODES = {
    "1H",
    "HT",
    "2H",
    "ET",
    "BT",
    "P",
    "SUSP",
    "INT",
    "LIVE",
}

FINISHED_STATUS_SHORT_CODES = {
    "FT",
    "AET",
    "PEN",
}

SCHEDULED_STATUS_SHORT_CODES = {
    "TBD",
    "NS",
}

POSTPONED_STATUS_SHORT_CODES = {
    "PST",
}

CANCELLED_STATUS_SHORT_CODES = {
    "CANC",
    "ABD",
    "AWD",
    "WO",
}

# constants based on API-Football events

API_EVENT_TYPE_GOAL = "goal"
API_EVENT_TYPE_CARD = "card"
API_EVENT_TYPE_SUBSTITUTION = "subst"
API_EVENT_TYPE_VAR = "var"

API_EVENT_DETAIL_NORMAL_GOAL = "normal goal"
API_EVENT_DETAIL_OWN_GOAL = "own goal"
API_EVENT_DETAIL_PENALTY = "penalty"
API_EVENT_DETAIL_MISSED_PENALTY = "missed penalty"
API_EVENT_DETAIL_YELLOW_CARD = "yellow card"
API_EVENT_DETAIL_RED_CARD = "red card"

EVENT_TYPE_GOAL = "goal"
EVENT_TYPE_OWN_GOAL = "own_goal"
EVENT_TYPE_PENALTY_GOAL = "penalty_goal"
EVENT_TYPE_PENALTY_MISS = "penalty_miss"
EVENT_TYPE_YELLOW_CARD = "yellow_card"
EVENT_TYPE_RED_CARD = "red_card"
EVENT_TYPE_SUBSTITUTION = "substitution"
EVENT_TYPE_VAR = "var"
EVENT_TYPE_OTHER = "other"
