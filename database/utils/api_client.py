import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

API_KEY = os.getenv("API_FOOTBALL_API_KEY")

if not API_KEY:
    raise ValueError("Missing API_FOOTBALL_API_KEY environment variable")

BASE_URL = "https://v3.football.api-sports.io"

HEADERS = {"x-apisports-key": API_KEY}


def api_get(path: str, params: dict) -> dict:
    response = requests.get(
        f"{BASE_URL}{path}",
        headers=HEADERS,
        params=params,
        timeout=30,
    )

    response.raise_for_status()
    return response.json()
