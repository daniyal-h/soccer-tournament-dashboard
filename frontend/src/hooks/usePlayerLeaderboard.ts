import { getPlayerLeaderboard } from '@/api/playerLeaderboardsApi';

import type { PlayerLeaderboardOptions } from '@/types/playerLeaderboard';

import { EMPTY_MESSAGES } from '@/constants/playerLeaderboards';
import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function usePlayerLeaderboard({ tournament_id, category }: PlayerLeaderboardOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.playerLeaderboard.all(tournament_id, category),
    queryFn: () => getPlayerLeaderboard({ tournament_id, category }),
    staleTime: QUERY_STALE_TIMES.playerLeaderboard,
    errorMessages: {
      notFound: 'Leaderboard was not found.',
      generic: 'Failed to load leaderboard.',
    },
  });

  const playerLeaderboard = query.data ?? null;
  const leaderboard = playerLeaderboard?.leaderboard ?? [];

  const emptyState =
    !query.isInitialLoading && !query.displayError && leaderboard.length === 0
      ? EMPTY_MESSAGES[category]
      : null;

  return {
    playerLeaderboard,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    emptyState,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
