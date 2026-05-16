from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_tournaments() -> dict:
    return {"message": "not yet implemented"}


@router.get("/{tournament_id}")
async def get_tournament_details(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}
