import { type TeamSummary } from './team';

export type MatchStage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'
  | 'other';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Match {
  id: number;
  team_a: TeamSummary;
  team_b: TeamSummary;
  kickoff_time: string;
  stage: MatchStage;
  group: string | null;
  status: MatchStatus;
  venue: string | null;
  city: string | null;
  elapsed: number | null;
  team_a_score: number | null;
  team_b_score: number | null;
  team_a_penalties: number | null;
  team_b_penalties: number | null;
}

export interface MatchGroup {
  day: string;
  matches: Match[];
}

export interface MatchOptions {
  match_id: number;
}

export interface MatchesOptions {
  tournament_id: number;
}
