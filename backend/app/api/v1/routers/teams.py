from fastapi import APIRouter

router = APIRouter()


@router.get("/{team_id}")
async def get_team(team_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.get("/{team_id}")
async def get_team_roster(team_id: int, tournament_id: int) -> dict:
    return {"message": "not yet implemented"}


@router.get("/{team_id}/matches")
async def get_team_matches(
    team_id: int, tournament_id: int | None = None, status: str | None = None, limit: int = 20
) -> dict:
    return {"message": "not yet implemented"}
