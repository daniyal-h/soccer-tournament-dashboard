import { getStandings } from '@/api/standingsApi';

import type { StandingsOptions } from '@/types/standing';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useStandings({ tournamentId, group }: StandingsOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.standings.all(tournamentId, group),
    queryFn: () => getStandings({ tournamentId, group }),
    staleTime: QUERY_STALE_TIMES.standings,
    errorMessages: {
      notFound: 'Groups and rankings will appear once tournament data is available.',
      generic: 'Failed to load standings.',
    },
  });

  return {
    standings: query.data ?? {},
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
