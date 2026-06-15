import { type TeamSummary } from './team';

// a Standing includes some details of its team

export interface StandingStats {
  position: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
export interface Standing extends StandingStats {
  team: TeamSummary;
}

export interface StandingsOptions {
  tournamentId: number;
  group?: string;
}
