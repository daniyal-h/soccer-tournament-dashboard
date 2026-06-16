import type { Match } from './match';
import type { StandingStats } from './standing';

export interface TeamSummary {
  id: number;
  name: string;
  short_name: string;
  logo_url: string | null;
}

export interface TournamentTeamOptions {
  tournament_id: number;
  team_id: number;
}

export interface TeamProfile {
  team: TeamSummary;
  group: string;
  standing: StandingStats | null;
}

export interface TeamMatches {
  matches: Match[];
}
