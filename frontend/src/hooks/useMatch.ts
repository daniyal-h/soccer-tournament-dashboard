import { useCallback, useEffect, useState } from 'react';

import { getMatch } from '@/api/matchesApi';

import type { Match } from '@/types/match';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

/**
 * Logic for getting a specified match.
 * Catch and wrap known errors.
 */
export function useMatch(match_id: number) {
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const loadMatch = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setCanRetry(true);

    return getMatch({ match_id })
      .then(setMatch)
      .catch((err) => {
        setMatch(null);

        const errorState = getApiErrorState(err, {
          notFound: 'Match was not found.',
          generic: 'Failed to load match.',
        });

        setError(new Error(errorState.message));
        setCanRetry(errorState.canRetry);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [match_id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMatch();
  }, [loadMatch]);

  return { match, isLoading, error, refetch: loadMatch, canRetry };
}
