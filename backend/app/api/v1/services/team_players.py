from sqlalchemy.orm import Session

from app.api.v1.repositories import players as players_repo
from app.api.v1.repositories import team_players as team_players_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import players as players_service
from app.api.v1.services import teams as teams_service
from app.models.players import Player
from app.models.team_player import TeamPlayer
from app.schemas.teams import TeamPlayerRefreshRow


def update_team_players(
    db: Session,
    tournament_id: int,
    rows: list[TeamPlayerRefreshRow],
) -> None:
    players = [
        Player(
            external_api_id=row.external_player_id,
            display_name=row.display_name,
            first_name=row.first_name,
            last_name=row.last_name,
            date_of_birth=row.date_of_birth,
            photo_url=row.photo_url,
            nationality=row.nationality,
            height=row.height,
        )
        for row in rows
    ]

    players_repo.upsert_players(db, players)

    team_player_rows = []

    for row in rows:
        player_id = players_service.get_player_id_from_external_id(
            db,
            row.external_player_id,
        )
        team_id = teams_service.get_team_id_from_external_id(
            db,
            row.external_team_id,
        )

        team_player_rows.append(
            TeamPlayer(
                tournament_id=tournament_id,
                team_id=team_id,
                player_id=player_id,
                squad_number=row.squad_number,
                position=row.position,
            )
        )

    team_players_repo.upsert_team_players(db, team_player_rows)

    cache_service.invalidate_cache(db, f"team_squad:{tournament_id}")
