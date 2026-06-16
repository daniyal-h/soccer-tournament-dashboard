import { useTournament } from '@/context/TournamentContext';

import { useTeamProfile } from '@/hooks/useTeamProfile';

import type { TeamPageProps } from '@/types/team';

import EmptyState from '../feedback/EmptyState';
import ErrorState from '../feedback/ErrorState';
import TeamProfileHeader from './teamOverview/TeamProfileHeader';
import TeamProfileSkeleton from './teamOverview/TeamProfileSkeleton';
import TeamStageSummary from './teamOverview/TeamStageSummary';

const TeamOverviewSection = ({ teamId }: TeamPageProps) => {
  const { selectedTournamentId, error: tournamentError } = useTournament();

  const { teamProfile, isLoading, error, refetch, canRetry } = useTeamProfile({
    tournament_id: selectedTournamentId,
    team_id: teamId,
  });

  if (isLoading) {
    return <TeamProfileSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Profile Unavailable"
        description={error.message}
        onAction={canRetry ? () => refetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  if (!teamProfile) {
    return <ErrorState title="Profile Unavailable" description="Team profile not found." />;
  }

  return (
    <>
      <TeamProfileHeader teamProfile={teamProfile} />

      {teamProfile.standing ? (
        <TeamStageSummary standing={teamProfile.standing} />
      ) : (
        <EmptyState
          title="No group stage summary yet"
          description="This team does not have standings data for the selected tournament."
        />
      )}
    </>
  );
};

export default TeamOverviewSection;