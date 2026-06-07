import { type Team } from './team';

// a Standing includes some details of its team
export interface Standing {
  team: Team;
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

export interface StandingsOptions {
  tournamentId: number;
  group?: string;
}
