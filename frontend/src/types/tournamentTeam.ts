import type { MatchStage } from './match';
import type { TeamSummary } from './team';

export interface TournamentTeam {
  team: TeamSummary;
  group: string | null;
  final_rank: number | null;
  stage_reached: MatchStage | null;
}

export interface TournamentTeamOptions {
  tournament_id: number;
}
