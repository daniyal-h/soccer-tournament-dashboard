import { getMatch } from '@/api/matchesApi';

import { AUTO_REFETCH_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useMatch(match_id: number) {
  const query = useApiQuery({
    queryKey: queryKeys.matches.detail(match_id),
    queryFn: () => getMatch({ match_id }),
    staleTime: QUERY_STALE_TIMES.match,

    refetchInterval: (query) => {
      const match = query.state.data;
      return match?.status === 'live' ? AUTO_REFETCH_TIMES.matches : false;
    },
    errorMessages: {
      notFound: 'Match was not found.',
      generic: 'Failed to load match.',
    },
  });

  return {
    match: query.data ?? null,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
