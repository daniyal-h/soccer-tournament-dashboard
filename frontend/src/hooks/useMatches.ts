import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { getMatches } from '@/api/matchesApi';

import type { Match, MatchesOptions } from '@/types/matches';

/**
 * Logic for getting and processing available tournaments
 * Catch and wrap known errors, otherwise keep them generic
 */
export function useMatches({ tournament_id }: MatchesOptions) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const loadMatches = useCallback(() => {
    setIsLoading(true);
    setError(null);

    return getMatches({ tournament_id })
      .then(setMatches)
      .catch((err) => {
        setMatches([]); // clear data

        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setError(new Error('No matches available.'));
          setCanRetry(false);
          return;
        }

        if (err instanceof ApiError && err.code === 'RATE_LIMITED') {
          setError(new Error('Too many requests. Please wait a moment and try again.'));
          return;
        }

        if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
          setError(new Error('Unable to reach the server.'));
          return;
        }

        setError(new Error('Failed to load matches.'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tournament_id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMatches();
  }, [loadMatches]);

  return { matches, isLoading, error, refetch: loadMatches, canRetry };
}
