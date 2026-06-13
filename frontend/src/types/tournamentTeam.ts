import type { TeamSummary } from './team';

export interface TournamentTeam {
  summary: TeamSummary;
  group: string | null;
  final_rank: number | null;
  stage_reached: string | null;
}
