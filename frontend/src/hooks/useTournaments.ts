import { useEffect, useState } from 'react';
import { getTournaments } from '@/api/tournamentsApi';
import type { Tournament } from '@/types/tournament';

export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    getTournaments()
      .then(setTournaments)
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to load tournaments'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { tournaments, isLoading, error };
}
