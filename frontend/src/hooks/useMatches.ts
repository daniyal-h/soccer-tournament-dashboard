import { useCallback, useEffect, useState } from 'react';

import { getMatches } from '@/api/matchesApi';

import type { MatchesOptions, MatchGroup } from '@/types/matches';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';
import { groupMatchesByDay } from '@/utils/matches/matchCardHelper';

/**
 * Logic for getting and processing available matches
 * Catch and wrap known errors, otherwise keep them generic
 */
export function useMatches({ tournament_id }: MatchesOptions) {
  //const [matches, setMatches] = useState<Match[]>([])
  const [groupedMatches, setGroupedMatches] = useState<MatchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emptyState, setEmptyState] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const loadMatches = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setEmptyState(null);
    setCanRetry(true);

    return getMatches({ tournament_id })
      .then((matches) => {
        if (matches.length === 0) {
          setGroupedMatches([]);
          setEmptyState('The schedule will appear once tournament data is available.');
          setCanRetry(false);
          return;
        }

        setGroupedMatches(groupMatchesByDay(matches));
      })
      .catch((err) => {
        setGroupedMatches([]);

        const errorState = getApiErrorState(err, {
          notFound: 'No matches were found.',
          generic: 'Failed to load matches.',
        });

        setError(new Error(errorState.message));
        setCanRetry(errorState.canRetry);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tournament_id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMatches();
  }, [loadMatches]);

  return { groupedMatches, isLoading, error, emptyState, refetch: loadMatches, canRetry };
}
