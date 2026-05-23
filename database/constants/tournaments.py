from datetime import date

# (local_db_id, external_api_id, season, end_date)
SUPPORTED_TOURNAMENTS = [
    # (1, 1, "2026", date(2026, 7, 19)),  # FIFA World Cup 2026
    # (2, 1, "2022", date(2022, 12, 18)),  # FIFA World Cup 2022
    # (3, 4, "2024", date(2024, 7, 14)),  # UEFA Euro 2024
    (4, 9, "2024", date(2024, 7, 14)),  # Copa America 2024
    # (5, 6, "2025", date(2025, 12, 21)),  # Africa Cup of Nations 2025
    # (6, 15, "2025", date(2025, 7, 13)), # Fifa Club World Cup 2025
]
