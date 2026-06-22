import type {
  PlayerLeaderboardApiResponse,
  PlayerLeaderboardOptions,
  RankedPlayer,
} from '@/types/playerLeaderboard';

import { LEADERBOARD_CATEGORIES } from '@/constants/playerLeaderboards';

import { apiGet } from './client';
import { isPlayerSimpleSummary } from './playersApi';
import { isTeamSummary } from './teamsApi';

export function isRankedPlayer(value: unknown): value is RankedPlayer {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as RankedPlayer;

  return (
    typeof response.rank === 'number' &&
    typeof response.value === 'number' &&
    isPlayerSimpleSummary(response.player) &&
    isTeamSummary(response.team) &&
    (typeof response.appearances === 'number' || response.appearances === null) &&
    (typeof response.minutes_played === 'number' || response.minutes_played === null) &&
    (typeof response.rating === 'number' || response.rating === null)
  );
}

export function isPlayerLeaderboardResponse(value: unknown): value is PlayerLeaderboardApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as PlayerLeaderboardApiResponse;

  return (
    LEADERBOARD_CATEGORIES.includes(response.category) &&
    Array.isArray(response.data) &&
    response.data.every(isRankedPlayer)
  );
}

export async function getPlayerLeaderboard({ tournament_id, category }: PlayerLeaderboardOptions) {
  const path = `/tournaments/${tournament_id}/player-leaderboards?category=${encodeURIComponent(category)}`;

  const response = await apiGet<PlayerLeaderboardApiResponse>(path);

  if (!isPlayerLeaderboardResponse(response)) {
    throw new Error('Invalid player leaderboard response');
  }

  return {
    category: response.category,
    leaderboard: response.data,
  };
}
