import { useEffect, useState } from 'react';
import { getStandings } from '@/api/standingsApi';
import type { Standing, StandingsOptions } from '@/types/standings';

export function useStandings({ tournamentId, group }: StandingsOptions) {
  const [standings, setStandings] = useState<Record<string, Standing[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getStandings({ tournamentId, group })
      .then(setStandings)
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to fetch standings'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [tournamentId, group]);

  return { standings, isLoading, error };
}
