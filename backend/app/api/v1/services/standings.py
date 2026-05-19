from sqlalchemy.orm import Session

from app.api.v1.repositories import standings as standings_repo
from app.models.standing import Standing
from app.schemas.errors import NotFoundError


# return a dictionary of all groups (unless specified) and their standings
def get_standings(
    db: Session, tournament_id: int, group: str | None = None
) -> dict[str, list[Standing]]:
    # get a flat list of standings
    rows = standings_repo.get_all_standings(db, tournament_id)

    if not rows:
        raise NotFoundError(f"No standings found for tournament {tournament_id}")

    # convert the flat list into a dictionary of groups
    grouped: dict[str, list[Standing]] = {}
    for row in rows:
        grouped.setdefault(row.group, []).append(row)

    # if group was specified, return only those standings
    if group:
        if group not in grouped:
            raise NotFoundError(f"Group {group} not found in tournament {tournament_id}")
        return {group: grouped[group]} # match response model

    return grouped
