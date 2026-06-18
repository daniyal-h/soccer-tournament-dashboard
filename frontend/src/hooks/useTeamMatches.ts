import { getTeamMatches } from '@/api/teamsApi';

import type { TournamentTeamOptions } from '@/types/team';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

import { groupMatchesByStage } from '@/utils/teams/teamMatchesHelper';

export function useTeamMatches({ tournament_id, team_id }: TournamentTeamOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.teams.matches(tournament_id, team_id),
    queryFn: () => getTeamMatches({ tournament_id, team_id }),
    staleTime: QUERY_STALE_TIMES.teams,
    errorMessages: {
      notFound: 'Team was not found.',
      generic: 'Failed to load team matches.',
    },
  });

  const teamMatches = query.data ?? null;
  const matches = teamMatches?.matches ?? [];

  const groupedMatches = groupMatchesByStage(matches);
  const lastFiveMatches = matches.filter((match) => match.status === 'finished').slice(-5);

  const emptyState =
    !query.isInitialLoading && !query.displayError && matches.length === 0
      ? 'Team matches will appear once tournament data is available.'
      : null;

  return {
    groupedMatches,
    lastFiveMatches,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    emptyState,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
