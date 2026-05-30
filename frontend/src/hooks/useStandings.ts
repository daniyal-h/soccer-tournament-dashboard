import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { getStandings } from '@/api/standingsApi';

import type { Standing, StandingsOptions } from '@/types/standings';

/**
 * Logic for getting and processing standings data for a given tournament
 * Catch and wrap known errors, otherwise keep them generic
 * Include retry logic triggered upon error state rendering
 */
export function useStandings({ tournamentId, group }: StandingsOptions) {
  const [standings, setStandings] = useState<Record<string, Standing[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const loadStandings = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setCanRetry(true);

    return getStandings({ tournamentId, group })
      .then(setStandings)
      .catch((err) => {
        setStandings({}); // clear data

        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setError(new Error('Groups and rankings will appear once tournament data is available.'));
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

        setError(new Error('Failed to load standings.'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tournamentId, group]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStandings();
  }, [loadStandings]);

  return {
    standings,
    isLoading,
    error,
    refetch: loadStandings,
    canRetry,
  };
}
