from fastapi import APIRouter

router = APIRouter()


@router.get("/{tournament_id}")
async def get_matches(
    tournament_id: int,
    group: str | None = None,
    date: str | None = None,
    stage: str | None = None,
    team_id: int | None = None,
    limit: int | None = None,
) -> dict:
    return {"message": "not yet implemented"}
