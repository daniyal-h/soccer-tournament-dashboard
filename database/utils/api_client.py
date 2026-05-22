import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

API_KEY = os.getenv("API_FOOTBALL_API_KEY")
BACKEND_URL = os.getenv("BACKEND_URL")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

if not API_KEY:
    raise ValueError("Missing API_FOOTBALL_API_KEY environment variable")

if not BACKEND_URL:
    raise ValueError("Missing BACKEND_URL environment variable")

if not ADMIN_TOKEN:
    raise ValueError("Missing ADMIN_TOKEN environment variable")

BASE_URL = "https://v3.football.api-sports.io"

HEADERS_GET = {"x-apisports-key": API_KEY}
HEADERS_PUT = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json",
}


def api_get(path: str, params: dict) -> dict:
    response = requests.get(
        f"{BASE_URL}{path}",
        headers=HEADERS_GET,
        params=params,
        timeout=30,
    )

    response.raise_for_status()
    return response.json()


def api_put(path: str, data: dict | list) -> dict:
    response = requests.put(
        f"{BACKEND_URL}{path}",
        headers=HEADERS_PUT,
        json=data,
        timeout=30,
    )
    response.raise_for_status()
    return response.json()
