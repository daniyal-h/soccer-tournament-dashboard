import os
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BACKEND_URL = os.getenv("BACKEND_URL")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

if not BACKEND_URL:
    raise ValueError("Missing BACKEND_URL environment variable")

if not ADMIN_TOKEN:
    raise ValueError("Missing ADMIN_TOKEN environment variable")

HEADERS = {
    "Authorization": f"Bearer {ADMIN_TOKEN}",
    "Content-Type": "application/json",
}


def backend_get(path: str, params: dict | None = None) -> dict | list:
    response = requests.get(
        f"{BACKEND_URL}{path}",
        headers=HEADERS,
        params=params,
        timeout=30,
    )

    response.raise_for_status()
    return response.json()


def backend_put(path: str, data: dict | list) -> dict:
    response = requests.put(
        f"{BACKEND_URL}{path}",
        headers=HEADERS,
        json=data,
        timeout=30,
    )

    response.raise_for_status()
    return response.json()
