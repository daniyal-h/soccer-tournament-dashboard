import { useEffect, useState } from 'react';
import { getTournaments } from '@/api/tournamentsApi';
import type { Tournament } from '@/types/tournament';
import { ApiError } from '@/api/client';

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
        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setError(new Error('No tournaments available.'));
          return;
        }

        if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
          setError(new Error('Unable to reach the server.'));
          return;
        }

        setError(new Error('Failed to load tournaments.'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { tournaments, isLoading, error };
}
