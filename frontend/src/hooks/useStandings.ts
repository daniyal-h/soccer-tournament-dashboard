import { useCallback, useEffect, useState } from 'react';

import { getStandings } from '@/api/standingsApi';

import type { Standing, StandingsOptions } from '@/types/standing';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

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
        setStandings({});

        const errorState = getApiErrorState(err, {
          notFound: 'Groups and rankings will appear once tournament data is available.',
          generic: 'Failed to load standings.',
        });

        setError(new Error(errorState.message));
        setCanRetry(errorState.canRetry);
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
