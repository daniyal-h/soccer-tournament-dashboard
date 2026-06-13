import { getMatchEvents } from '@/api/matchEventsApi';

import type { MatchEventsOptions } from '@/types/matchEvent';

import { AUTO_REFETCH_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useMatchEvents({ match_id, isLive = false }: MatchEventsOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.matches.events(match_id),
    queryFn: () => getMatchEvents({ match_id }),
    staleTime: QUERY_STALE_TIMES.matchEvents,

    // auto-refetch for live matches
    refetchInterval: isLive ? AUTO_REFETCH_TIMES.matches : false,

    errorMessages: {
      notFound: 'No events were found for this match.',
      generic: 'Failed to load match events.',
    },
  });

  // extract data and check for empty state
  const matchEvents = query.data?.data ?? [];
  const metadata = query.data?.metadata ?? null;

  const emptyState =
    !query.isInitialLoading && !query.displayError && matchEvents.length === 0
      ? 'Match events will appear once the data is available.'
      : null;

  return {
    matchEvents,
    metadata,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    emptyState,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
