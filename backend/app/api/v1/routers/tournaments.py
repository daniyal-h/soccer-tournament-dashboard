from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.services import tournaments as tournaments_service
from app.core.database import get_db
from app.schemas.tournaments import TournamentResponse

router = APIRouter()


@router.get("/", response_model=list[TournamentResponse])
def get_tournaments(db: Annotated[Session, Depends(get_db)]) -> dict:
    return tournaments_service.get_tournaments(db)


@router.get("/{tournament_id}")
async def get_tournament_details(tournament_id: int) -> dict:
    return {"message": "not yet implemented"}
