import { getPlayerLeaderboard } from '@/api/playerLeaderboardsApi';

import type { PlayerLeaderboardOptions } from '@/types/playerLeaderboard';

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

  return {
    playerLeaderboard: query.data ?? null,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}