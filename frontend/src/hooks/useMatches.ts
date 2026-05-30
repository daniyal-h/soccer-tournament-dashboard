import { useCallback, useEffect, useState } from 'react';

import { ApiError } from '@/api/client';
import { getMatches } from '@/api/matchesApi';

import type { Match, MatchesOptions, MatchGroup } from '@/types/matches';

function getMatchDay(match: Match): string {
  const { kickoff_time } = match;
  return new Date(kickoff_time).toLocaleString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Logic for getting and processing available matches
 * Catch and wrap known errors, otherwise keep them generic
 */
export function useMatches({ tournament_id }: MatchesOptions) {
  //const [matches, setMatches] = useState<Match[]>([])
  const [groupedMatches, setGroupedMatches] = useState<MatchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [emptyState, setEmptyState] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const loadMatches = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setEmptyState(null);
    setCanRetry(true);

    return getMatches({ tournament_id })
      .then((matches) => {
        // check for empty state
        if (matches.length === 0) {
          setEmptyState('The schedule will appear once tournament data is available.');
          setCanRetry(false);
          return;
        }

        // defensively UI
        const sortedMatches = [...matches].sort(
          (a, b) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime(),
        );

        // group all matches on the same day with a map
        const groupedMatchesMap: Record<string, Match[]> = {};

        sortedMatches.forEach((match: Match) => {
          const day = getMatchDay(match); // in the form "June 11"

          if (!groupedMatchesMap[day]) {
            groupedMatchesMap[day] = [];
          }

          groupedMatchesMap[day].push(match);
        });

        // convert map to list of match groups
        const groupedMatches: MatchGroup[] = Object.entries(groupedMatchesMap).map(
          ([day, matches]) => ({
            day,
            matches,
          }),
        );

        setGroupedMatches(groupedMatches);
      })
      .catch((err) => {
        setGroupedMatches([]); // clear data

        if (err instanceof ApiError && err.code === 'NOT_FOUND') {
          setError(new Error('No matches were found.'));
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

  return { groupedMatches, isLoading, error, emptyState, refetch: loadMatches, canRetry };
}
