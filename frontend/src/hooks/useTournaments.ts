import { getTournaments } from '@/api/tournamentsApi';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useTournaments() {
  const query = useApiQuery({
    queryKey: queryKeys.tournaments.all,
    queryFn: () => getTournaments(),
    staleTime: QUERY_STALE_TIMES.tournaments,
    errorMessages: {
      notFound: 'No tournaments available.',
      generic: 'Failed to load tournaments.',
    },
  });

  return {
    tournaments: query.data ?? [],
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    refetch: query.refetch,
    canRetry: query.canRetry,
  };
}
