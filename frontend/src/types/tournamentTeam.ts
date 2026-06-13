import type { TeamSummary } from './team';

export interface TournamentTeam {
  team: TeamSummary;
  group: string | null;
  final_rank: number | null;
  stage_reached: string | null;
}

export interface TournamentTeamOptions {
  tournament_id: number;
}
