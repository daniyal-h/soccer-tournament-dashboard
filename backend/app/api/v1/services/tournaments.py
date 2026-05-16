from sqlalchemy.orm import Session

from app.api.v1.repositories import tournaments as tournaments_repo
from app.models.tournament import Tournament
from app.schemas.errors import NotFoundError


async def get_tournaments(db: Session) -> list[Tournament]:
    tournaments = await tournaments_repo.get_all_tournaments(db)

    if not tournaments:
        raise NotFoundError("No tournaments found")

    return tournaments
