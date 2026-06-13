export interface TeamSummary {
  id: number;
  name: string;
  short_name: string;
  logo_url: string | null;
}

export interface TournamentTeam {
  summary: TeamSummary;
  group: string | null;
  final_rank: number | null;
  stage_reached: string | null;
}
