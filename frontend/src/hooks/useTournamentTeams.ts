import { getTournamentTeams } from '@/api/tournamentTeamsApi';

import type { TournamentTeamOptions } from '@/types/tournamentTeam';

import { AUTO_REFETCH_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useTournamentTeams({ tournament_id }: TournamentTeamOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.tournamentTeams.all(tournament_id),
    queryFn: () => getTournamentTeams({ tournament_id }),
    staleTime: QUERY_STALE_TIMES.tournamentTeams,

    refetchInterval: (query) => {
      const tournamentTeams = query.state.data;

      if (!tournamentTeams) {
        return false;
      }

      const hasActiveKnockoutTeams = tournamentTeams.some(
        (tournamentTeam) =>
          tournamentTeam.stage_reached !== null && tournamentTeam.final_rank === null,
      );

      return hasActiveKnockoutTeams ? AUTO_REFETCH_TIMES.tournamentTeams : false;
    },

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
