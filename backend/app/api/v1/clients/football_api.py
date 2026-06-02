import requests

from app.constants.external_apis import API_FOOTBALL_BASE_URL
from app.core.config import settings


def football_get(path: str, params: dict) -> dict:
    response = requests.get(
        f"{API_FOOTBALL_BASE_URL}{path}",
        headers={
            "x-apisports-key": settings.API_FOOTBALL_API_KEY,
        },
        params=params,
        timeout=10,
    )

    response.raise_for_status()
    return response.json()
