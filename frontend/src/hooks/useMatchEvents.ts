import { useCallback, useEffect, useState } from 'react';

import { getMatchEvents } from '@/api/MatchEventsApi';

import type { MatchEvent, MatchEventsOptions } from '@/types/matchEvent';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

/**
 * Logic for fetching and processing matches events.
 * Catch and wrap known errors.
 */
export function useMatchEvents({ match_id }: MatchEventsOptions) {
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emptyState, setEmptyState] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const loadMatchEvents = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setEmptyState(null);
    setCanRetry(true);

    return getMatchEvents({ match_id })
      .then((matchEvents) => {
        if (matchEvents.length === 0) {
          setMatchEvents([]);
          setEmptyState('Match events will appear once the data is available.');
          setCanRetry(false);
          return;
        }

        setMatchEvents(matchEvents);
      })
      .catch((err) => {
        setMatchEvents([]);

        const errorState = getApiErrorState(err, {
          notFound: 'No events were found for this match.',
          generic: 'Failed to load match events.',
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
    void loadMatchEvents();
  }, [loadMatchEvents]);

  return { matchEvents, isLoading, error, emptyState, refetch: loadMatchEvents, canRetry };
}
