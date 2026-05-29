import { type Team } from './team';

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled';

export interface Match {
  id: number;
  team_a: Team;
  team_b: Team;
  kickoff_time: string;
  stage: string;
  group?: string;
  status: MatchStatus;
  venue?: string;
  team_a_score?: number;
  team_b_score?: number;
}
