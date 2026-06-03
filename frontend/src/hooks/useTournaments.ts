import { useEffect, useState } from 'react';

import { getTournaments } from '@/api/tournamentsApi';

import type { Tournament } from '@/types/tournament';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

/**
 * Logic for getting and processing available tournaments
 * Catch and wrap known errors, otherwise keep them generic
 */
export function useTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    getTournaments()
      .then(setTournaments)
      .catch((err) => {
        setTournaments([]);

        const errorState = getApiErrorState(err, {
          notFound: 'No tournaments available.',
          generic: 'Failed to load tournaments.',
        });

        setError(new Error(errorState.message));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { tournaments, isLoading, error };
}
