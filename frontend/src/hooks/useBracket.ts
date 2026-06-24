import { getBracket } from '@/api/bracketsApi';

import type { BracketOptions } from '@/types/bracket';

import { EMPTY_BRACKET } from '@/constants/brackets';
import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

import { hasBracketMatches } from '@/utils/bracket/bracketHelper';

export function useBracket({ tournament_id }: BracketOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.bracket.all(tournament_id),
    queryFn: () => getBracket({ tournament_id }),
    staleTime: QUERY_STALE_TIMES.bracket,
    errorMessages: {
      notFound: 'Bracket was not found',
      generic: 'Failed to load the bracket.',
    },
  });

  const bracket = query.data ?? EMPTY_BRACKET;

  const emptyState =
    !query.isInitialLoading && !query.displayError && !hasBracketMatches(bracket)
      ? 'The bracket will appear once knockout matches are available.'
      : null;

  return {
    bracket,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    emptyState,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
