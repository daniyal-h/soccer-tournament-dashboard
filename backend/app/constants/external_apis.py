API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"

API_FOOTBALL_STANDINGS_ENDPOINT = "/standings"
API_FOOTBALL_FIXTURES_ENDPOINT = "/fixtures"
API_FOOTBALL_EVENTS_ENDPOINT = "/fixtures/events"
STANDINGS_MARGIN_DAYS = 1
MATCHES_MARGIN_DAYS = 14

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
