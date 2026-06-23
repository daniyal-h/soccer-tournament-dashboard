from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.api.v1.repositories import cache as cache_repo
from app.api.v1.repositories import player_leaderboards as player_leaderboards_repo
from app.api.v1.services import cache as cache_service
from app.api.v1.services import players as players_service
from app.api.v1.services import teams as teams_service
from app.api.v1.services import tournaments as tournaments_service
from app.models.enums import LeaderboardType
from app.models.player_leaderboards import PlayerLeaderboard
from app.schemas.player_leaderboards import PlayerLeaderboardRefreshRow, PlayerLeaderboardResponse
from app.utils.cache_helper import get_expires_at, get_tournament_data_ttl


def get_player_leaderboard(
    db: Session, tournament_id: int, category: LeaderboardType
) -> PlayerLeaderboardResponse:
    """
    Get the top-20 players in the specified tournament and category.
    Check cache first, otherwise retrieve data, cache and return it.
    """
    cache_key = f"player_leaderboard:{tournament_id}:{category.value}"
    cached = cache_service.get_cache(db, cache_key)

    if cached is not None:
        # cache stores serialized response-shaped data
        return PlayerLeaderboardResponse.model_validate(cached)

    # handle tournament ID validation
    tournament = tournaments_service.get_tournament(db, tournament_id)
    leaderboard = player_leaderboards_repo.get_tournament_leaderboard_by_category(
        db, tournament_id, category
    )

    player_leaderboard = PlayerLeaderboardResponse(category=category, data=leaderboard)

    ttl = get_tournament_data_ttl(tournament)

    cache_service.set_cache(
        db, cache_key, payload=jsonable_encoder(player_leaderboard), expires_at=get_expires_at(ttl)
    )

    return player_leaderboard


def update_player_leaderboards(
    db: Session, tournament_id: int, data: list[PlayerLeaderboardRefreshRow]
) -> None:
    rows = []

    for row in data:
        # resolve IDs
        player_id = players_service.get_player_id_from_external_id(db, row.external_player_id)
        team_id = teams_service.get_team_id_from_external_id(db, row.external_team_id)

        # make the PlayerLeaderboard object with resolved data
        rows.append(
            PlayerLeaderboard(
                tournament_id=tournament_id,
                player_id=player_id,
                team_id=team_id,
                category=row.category,
                rank=row.rank,
                value=row.value,
                appearances=row.appearances,
                minutes_played=row.minutes_played,
                rating=row.rating,
            )
        )

    player_leaderboards_repo.replace_player_leaderboards_in_tournament(db, tournament_id, rows)
    cache_repo.invalidate_cache_prefix(db, f"player_leaderboard:{tournament_id}:")
