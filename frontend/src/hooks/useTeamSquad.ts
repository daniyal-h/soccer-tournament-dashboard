import { getTeamSquad } from '@/api/teamsApi';

import type { TournamentTeamOptions } from '@/types/team';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';

import { groupSquadByPosition } from '@/utils/teams/teamSquadHelper';

export function useTeamSquads({ tournament_id, team_id }: TournamentTeamOptions) {
  const query = useApiQuery({
    queryKey: queryKeys.teams.squad(tournament_id, team_id),
    queryFn: () => getTeamSquad({ tournament_id, team_id }),
    staleTime: QUERY_STALE_TIMES.teams,
    errorMessages: {
      notFound: 'Team was not found.',
      generic: 'Failed to load team squad.',
    },
  });

  const teamSquad = query.data ?? null;
  const squad = teamSquad?.squad ?? [];

  const groupedSquad = groupSquadByPosition(squad);

  const emptyState =
    !query.isInitialLoading && !query.displayError && squad.length === 0
      ? 'The squad will appear once tournament data is available.'
      : null;

  return {
    groupedSquad,
    isLoading: query.isInitialLoading,
    isRefreshing: query.isRefreshing,
    error: query.displayError,
    emptyState,
    refetch: query.retry,
    canRetry: query.canRetry,
  };
}
