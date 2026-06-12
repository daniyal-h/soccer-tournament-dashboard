from sqlalchemy.orm import Session

from app.api.v1.repositories import matches as matches_repo
from app.api.v1.repositories import refresh_jobs as refresh_jobs_repo
from app.api.v1.repositories import standings as standings_repo
from app.api.v1.services import tournament_teams as tournament_teams_service
from app.api.v1.services import tournaments as tournaments_service
from app.models.match import Match, StageType, StatusType
from app.models.refresh_job import JobName
from app.schemas.tournament_teams import TeamRankingRefreshRow
from app.utils.refresh_summary import RefreshSummary

KNOCKOUT_STAGES = {
    StageType.ROUND_OF_32,
    StageType.ROUND_OF_16,
    StageType.QUARTER_FINAL,
    StageType.SEMI_FINAL,
    StageType.THIRD_PLACE,
    StageType.FINAL,
}

STAGE_SORT_ORDER = {
    StageType.FINAL: 1,
    # third place and semi final have equal weight as not all tournaments have 3rd place matches
    StageType.SEMI_FINAL: 2,
    StageType.THIRD_PLACE: 2,
    StageType.QUARTER_FINAL: 3,
    StageType.ROUND_OF_16: 4,
    StageType.ROUND_OF_32: 5,
    StageType.GROUP: 6,
}


def get_ranking_sort_key(row: TeamRankingRefreshRow) -> tuple:
    """
    Sort derived rows for predictable update output.

    Active knockout teams have no final_rank yet, so they come first by
    stage_reached. Finalized teams then follow by final_rank.
    """
    # active knockout teams
    if row.final_rank is None and row.stage_reached is not None:
        return (
            0,
            STAGE_SORT_ORDER.get(row.stage_reached, 99),
            row.team_id,
        )

    # finalized teams
    if row.final_rank is not None:
        return (
            1,
            row.final_rank,
            STAGE_SORT_ORDER.get(row.stage_reached, 99),
            row.team_id,
        )

    # defensive fallback
    return (
        2,
        row.team_id,
    )


def assign_active_knockout_teams(
    rankings_by_team_id: dict[int, TeamRankingRefreshRow],
    latest_stage_by_team_id: dict[int, StageType],
) -> None:
    """
    Mark teams that have reached knockouts but do not have final placement yet.

    These rows keep final_rank as None and use stage_reached to show current
    tournament progress.
    """
    for team_id, stage_reached in latest_stage_by_team_id.items():
        if team_id in rankings_by_team_id:
            continue

        rankings_by_team_id[team_id] = TeamRankingRefreshRow(
            team_id=team_id,
            final_rank=None,
            stage_reached=stage_reached,
        )


def get_group_stage_sort_key(team_id: int, standings_by_team_id: dict[int, dict]) -> tuple:
    standing = standings_by_team_id.get(team_id, {})

    return (
        -(standing.get("points") or 0),
        -(standing.get("goal_difference") or 0),
        -(standing.get("goals_for") or 0),
        standing.get("team_name") or "",
    )


def assign_rank_bucket(
    rankings_by_team_id: dict[int, TeamRankingRefreshRow],
    team_ids: list[int],
    starting_rank: int,
    stage_reached: StageType,
    standings_by_team_id: dict[int, dict],
) -> int:
    """
    Assign sequential ranks to teams that finished in the same stage bucket.

    Teams inside the same bucket are ordered by group-stage performance as a
    deterministic fallback.
    """
    unique_unranked_team_ids = sorted(
        {team_id for team_id in team_ids if team_id not in rankings_by_team_id},
        key=lambda team_id: get_group_stage_sort_key(team_id, standings_by_team_id),
    )

    for index, team_id in enumerate(unique_unranked_team_ids):
        rankings_by_team_id[team_id] = TeamRankingRefreshRow(
            team_id=team_id,
            final_rank=starting_rank + index,
            stage_reached=stage_reached,
        )

    return starting_rank + len(unique_unranked_team_ids)


def assign_rank(
    rankings_by_team_id: dict[int, TeamRankingRefreshRow],
    team_id: int | None,
    final_rank: int,
    stage_reached: StageType,
) -> None:
    if team_id is None:
        return

    rankings_by_team_id[team_id] = TeamRankingRefreshRow(
        team_id=team_id,
        final_rank=final_rank,
        stage_reached=stage_reached,
    )


def get_match_winner_and_loser(match: Match) -> tuple[int | None, int | None]:
    """
    Return winner and loser team IDs for a completed match.

    Penalties are used only when regular/extra-time scores are tied.
    If the winner cannot be determined, return None values.
    """
    if match.team_a_score is None or match.team_b_score is None:
        return None, None

    if match.team_a_score > match.team_b_score:
        return match.team_a_id, match.team_b_id

    if match.team_b_score > match.team_a_score:
        return match.team_b_id, match.team_a_id

    if match.team_a_penalties is None or match.team_b_penalties is None:
        return None, None

    if match.team_a_penalties > match.team_b_penalties:
        return match.team_a_id, match.team_b_id

    if match.team_b_penalties > match.team_a_penalties:
        return match.team_b_id, match.team_a_id

    return None, None


def all_matches_finished(matches: list[Match]) -> bool:
    return all(m.status == StatusType.FINISHED for m in matches)


def get_knockout_match_context(
    matches: list[Match],
) -> tuple[dict[StageType, list[Match]], dict[int, StageType]]:
    """
    Collect completed knockout matches by stage and each team's latest knockout stage.

    Completed matches are used for assigning finalized ranks, while latest stage
    tracks active knockout progress even before a match is finished.
    """
    matches_by_stage = {
        StageType.FINAL: [],
        StageType.THIRD_PLACE: [],
        StageType.SEMI_FINAL: [],
        StageType.QUARTER_FINAL: [],
        StageType.ROUND_OF_16: [],
        StageType.ROUND_OF_32: [],
    }

    latest_stage_by_team_id: dict[int, StageType] = {}

    for match in matches:
        if match.stage not in KNOCKOUT_STAGES:
            continue

        # track the deepest knockout stage each team has reached
        for team_id in (match.team_a_id, match.team_b_id):
            current_stage = latest_stage_by_team_id.get(team_id)

            if current_stage is None:
                latest_stage_by_team_id[team_id] = match.stage
                continue

            if STAGE_SORT_ORDER[match.stage] < STAGE_SORT_ORDER[current_stage]:
                latest_stage_by_team_id[team_id] = match.stage

        if match.stage in matches_by_stage:
            matches_by_stage[match.stage].append(match)

    return matches_by_stage, latest_stage_by_team_id


def build_standings_lookup(standings: list) -> tuple[dict[int, dict], set[int]]:
    # convert standings into fast lookup data for sorting tied buckets
    standings_by_team_id = {}
    all_team_ids = set()

    for standing in standings:
        goals_for = standing.goals_for or 0
        goals_against = standing.goals_against or 0

        standings_by_team_id[standing.team_id] = {
            "team_name": standing.team.name if standing.team else "",
            "points": standing.points or 0,
            "goal_difference": goals_for - goals_against,
            "goals_for": goals_for,
        }

        all_team_ids.add(standing.team_id)

    return standings_by_team_id, all_team_ids


def derive_team_rankings(
    db: Session,
    tournament_id: int,
) -> list[TeamRankingRefreshRow]:
    """
    Derive tournament team rankings from stored standings and matches.

    During group stage, no rows are returned so Teams page ordering stays stable.
    During knockouts, active teams receive stage_reached without final_rank.
    Eliminated/finalized teams receive final_rank and stage_reached.
    """
    standings = standings_repo.get_all_standings(db, tournament_id)
    matches = matches_repo.get_matches_by_tournament(db, tournament_id)

    if not standings and not matches:
        return []

    standings_by_team_id, all_team_ids = build_standings_lookup(standings)

    # include teams from matches as fallback if standings are incomplete
    for match in matches:
        all_team_ids.add(match.team_a_id)
        all_team_ids.add(match.team_b_id)

    matches_by_stage, latest_stage_by_team_id = get_knockout_match_context(matches)

    # stay stable before knockouts begin
    if not latest_stage_by_team_id:
        return []

    rankings_by_team_id: dict[int, TeamRankingRefreshRow] = {}

    # assign champion and runner-up after final has finished
    final_matches = matches_by_stage[StageType.FINAL]

    if final_matches and all_matches_finished(final_matches):
        winner_id, loser_id = get_match_winner_and_loser(final_matches[-1])

        assign_rank(rankings_by_team_id, winner_id, 1, StageType.FINAL)
        assign_rank(rankings_by_team_id, loser_id, 2, StageType.FINAL)

        next_rank = 3
    else:
        next_rank = 1

    # assign third and fourth if the tournament has a finished third-place match
    third_place_matches = matches_by_stage[StageType.THIRD_PLACE]

    if third_place_matches and all_matches_finished(third_place_matches):
        winner_id, loser_id = get_match_winner_and_loser(third_place_matches[-1])

        assign_rank(rankings_by_team_id, winner_id, next_rank, StageType.THIRD_PLACE)
        assign_rank(rankings_by_team_id, loser_id, next_rank + 1, StageType.THIRD_PLACE)

        next_rank += 2

    # if no third-place match exists, rank semi-final losers if those matches have finished
    semi_finals = matches_by_stage[StageType.SEMI_FINAL]

    if semi_finals and all_matches_finished(semi_finals):
        semi_final_losers = []

        for match in semi_finals:
            _, loser_id = get_match_winner_and_loser(match)

            if loser_id is not None:
                semi_final_losers.append(loser_id)

        next_rank = assign_rank_bucket(
            rankings_by_team_id,
            semi_final_losers,
            next_rank,
            StageType.SEMI_FINAL,
            standings_by_team_id,
        )

    # assign eliminated knockout teams stage by stage
    for stage in [StageType.QUARTER_FINAL, StageType.ROUND_OF_16, StageType.ROUND_OF_32]:
        # set rank only if all matches in the stage are finished
        stage_matches = matches_by_stage[stage]

        if not stage_matches or not all_matches_finished(stage_matches):
            continue

        losers = []

        for match in matches_by_stage[stage]:
            _, loser_id = get_match_winner_and_loser(match)

            if loser_id is not None:
                losers.append(loser_id)

        next_rank = assign_rank_bucket(
            rankings_by_team_id,
            losers,
            next_rank,
            stage,
            standings_by_team_id,
        )

    # keep currently alive knockout teams above finalized/eliminated teams
    assign_active_knockout_teams(rankings_by_team_id, latest_stage_by_team_id)

    # keep group-stage exits visible but unranked until final placement is known
    group_exit_team_ids = [
        team_id for team_id in all_team_ids if team_id not in rankings_by_team_id
    ]

    if final_matches and all_matches_finished(final_matches):
        assign_rank_bucket(
            rankings_by_team_id,
            group_exit_team_ids,
            next_rank,
            StageType.GROUP,
            standings_by_team_id,
        )
    else:
        for team_id in group_exit_team_ids:
            rankings_by_team_id[team_id] = TeamRankingRefreshRow(
                team_id=team_id,
                final_rank=None,
                stage_reached=None,
            )

    return sorted(rankings_by_team_id.values(), key=get_ranking_sort_key)


def refresh_team_rankings(db: Session) -> dict:
    """
    Get all live tournaments.
    Derive their rankings based on updated standings and matches.
    Upsert the new ranking to tournament-teams table.
    Return a refresh summary.
    Track job in refresh jobs table.
    """
    job_id = refresh_jobs_repo.create_job(db, JobName.TEAM_RANKINGS_REFRESH)
    summary = RefreshSummary(resource_name="Team Rankings")

    try:
        # entire command fails, mark job failed and crash
        tournaments = tournaments_service.get_refreshable_tournaments(db, margin_days=0)
        summary.tournaments_checked = len(tournaments)

        # derive new rankings for each tournament
        # every step adds to the summary
        for tournament in tournaments:
            try:
                ranking_rows = derive_team_rankings(db, tournament.id)

                if not ranking_rows:
                    summary.mark_skipped()
                    continue

                tournament_teams_service.update_team_rankings(
                    db, tournament.id, ranking_rows
                )  # TODO

                summary.mark_refreshed(rows_count=len(ranking_rows))

            except Exception as exc:
                summary.add_failure(
                    tournament_id=tournament.id,
                    external_api_id=tournament.external_api_id,
                    season=tournament.season,
                    reason=str(exc),
                )

        success = not summary.has_failures()
        result = summary.to_dict()

    except Exception:
        refresh_jobs_repo.complete_job(db, job_id, success=False)
        raise

    refresh_jobs_repo.complete_job(db, job_id, success=success)
    return result
