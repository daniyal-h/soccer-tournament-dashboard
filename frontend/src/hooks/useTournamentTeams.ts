import { getTournamentTeams } from '@/api/tournamentTeamsApi';

import type { TournamentTeamOptions } from '@/types/tournamentTeam';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useTournamentTeams({ tournament_id }: TournamentTeamOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.tournamentTeams.all(tournament_id),
    queryFn: () => getTournamentTeams({ tournament_id }),
    staleTime: QUERY_STALE_TIMES.tournamentTeams,
    errorMessages: {
      notFound: 'No teams were found.',
      generic: 'Failed to load teams.',
    },
  });

  return {
    tournamentTeams: query.data ?? [],
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
