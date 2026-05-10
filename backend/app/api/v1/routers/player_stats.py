from enum import Enum

from fastapi import APIRouter


class StatsCategory(str, Enum):
    goals = "goals"
    assists = "assists"
    yellow_cards = "yellow_cards"
    red_cards = "red_cards"
    appearances = "appearances"
    minutes_played = "minutes_played"


router = APIRouter()


@router.get("/{tournament_id}")
async def get_player_stats(
    tournament_id: int, stats: StatsCategory = StatsCategory.goals, limit: int = 10
) -> dict:
    return {"message": "not yet implemented"}
