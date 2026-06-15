import { getTeamProfile } from '@/api/teamsApi';

import type { TeamProfileOptions } from '@/types/team';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

export function UseTeamProfile({ tournament_id, team_id }: TeamProfileOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.teams.profile(tournament_id, team_id),
    queryFn: () => getTeamProfile({ tournament_id, team_id }),
    staleTime: QUERY_STALE_TIMES.teamProfile,
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
