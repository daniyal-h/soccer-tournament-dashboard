from fastapi import APIRouter

router = APIRouter()


@router.get("/{tournament_id}")
async def get_standings(tournament_id: int, group: str | None = None) -> dict:
    return {"message": "not yet implemented"}
