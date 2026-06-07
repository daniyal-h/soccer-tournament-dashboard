import { getMatches } from '@/api/matchesApi';

import type { MatchesOptions } from '@/types/match';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

import { groupMatchesByDay } from '@/utils/matches/matchCardHelper';

export function useMatches({ tournament_id }: MatchesOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.matches.all(tournament_id),
    queryFn: () => getMatches({ tournament_id }),
    staleTime: QUERY_STALE_TIMES.matches,
    errorMessages: {
      notFound: 'No matches were found.',
      generic: 'Failed to load matches.',
    },
  });

  const matches = query.data ?? [];
  const groupedMatches = groupMatchesByDay(matches);

  // don't show empty state while errors exist
  const emptyState =
    !query.isInitialLoading && !query.displayError && matches.length === 0
      ? 'The schedule will appear once tournament data is available.'
      : null;

  return {
    groupedMatches,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    emptyState,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
