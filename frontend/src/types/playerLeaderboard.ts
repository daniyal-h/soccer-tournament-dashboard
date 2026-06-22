import type { PlayerSimpleSummary } from './player';
import type { TeamSummary } from './team';

export type CategoryType = 'goals' | 'assists' | 'yellow_cards';

export interface PlayerLeaderboardOptions {
  tournament_id: number;
  category: CategoryType;
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
  category: CategoryType;
  data: RankedPlayer[];
}

export interface PlayerLeaderboard {
  category: CategoryType;
  leaderboard: RankedPlayer[];
}
