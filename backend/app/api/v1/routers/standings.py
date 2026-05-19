from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.v1.services import standings as standings_service
from app.core.database import get_db
from app.schemas.standings import StandingResponse

router = APIRouter()


@router.get("/{tournament_id}", response_model=dict[str, list[StandingResponse]])
def get_standings(
    db: Annotated[Session, Depends(get_db)], tournament_id: int, group: str | None = None
):
    return standings_service.get_standings(db, tournament_id, group)
