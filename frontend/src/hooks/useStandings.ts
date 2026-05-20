import { useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { getStandings } from '@/api/standingsApi';

import type { Standing, StandingsOptions } from '@/types/standings';

export function useStandings({ tournamentId, group }: StandingsOptions) {
  const [standings, setStandings] = useState<Record<string, Standing[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    setError(null);

    getStandings({ tournamentId, group })
      .then(setStandings)
      .catch((err) => {
        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setError(new Error('No standings available yet.'));
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

  return { standings, isLoading, error };
}
