from fastapi import APIRouter

router = APIRouter()


@router.post("/tournaments")
async def create_tournament() -> dict:
    return {"message": "not yet implemented"}


@router.post("/teams")
async def create_team() -> dict:
    return {"message": "not yet implemented"}


@router.post("/players")
async def create_player() -> dict:
    return {"message": "not yet implemented"}


@router.post("/matches")
async def create_match() -> dict:
    return {"message": "not yet implemented"}


@router.post("/standings")
async def create_standing() -> dict:
    return {"message": "not yet implemented"}


@router.post("/player_stats")
async def create_player_stats() -> dict:
    return {"message": "not yet implemented"}


@router.post("/match_events")
async def create_match_event() -> dict:
    return {"message": "not yet implemented"}


@router.put("/matches/{match_id}")
async def update_match(match_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.put("/standings/{tournament_id}")
async def update_standings(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.put("/player_stats/{tournament_id}")
async def update_player_stats(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}
