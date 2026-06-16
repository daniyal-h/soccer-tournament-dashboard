import { getTeamProfile } from '@/api/teamsApi';

import type { TournamentTeamOptions } from '@/types/team';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function useTeamProfile({ tournament_id, team_id }: TournamentTeamOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.teams.profile(tournament_id, team_id),
    queryFn: () => getTeamProfile({ tournament_id, team_id }),
    staleTime: QUERY_STALE_TIMES.teams,
    errorMessages: {
      notFound: 'Team was not found.',
      generic: 'Failed to load team profile.',
    },
  });

  return {
    teamProfile: query.data ?? null,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
