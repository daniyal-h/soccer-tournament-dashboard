import { type Team } from './team';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export type MatchStage =
  | 'group'
  | 'round_of_32'
  | 'round_of_16'
  | 'quarter_final'
  | 'semi_final'
  | 'third_place'
  | 'final'
  | 'other';

export interface Match {
  id: number;
  team_a: Team;
  team_b: Team;
  kickoff_time: string;
  stage: MatchStage;
  group?: string;
  status: MatchStatus;
  venue?: string;
  city?: string;
  elapsed?: number;
  team_a_score?: number;
  team_b_score?: number;
  team_a_penalties?: number;
  team_b_penalties?: number;
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
