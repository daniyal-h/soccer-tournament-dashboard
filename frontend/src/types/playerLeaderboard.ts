import type { PlayerSimpleSummary } from './player';
import type { TeamSummary } from './team';

export type LeadershipType = 'goals' | 'assists' | 'yellow_cards';

export interface PlayerLeaderboardOptions {
  tournament_id: number;
  category: LeadershipType;
}

export interface RankedPlayer {
  rank: number;
  value: number;
  player: PlayerSimpleSummary;
  team: TeamSummary;
  appearances: number | null;
  minutes_played: number | null;
  rating: number | null;
}

export interface PlayerLeaderboardApiResponse {
  category: LeadershipType;
  data: RankedPlayer[];
}

export interface PlayerLeaderboard {
  category: LeadershipType;
  leaderboard: RankedPlayer[];
}
