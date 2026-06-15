import { useTournament } from '@/context/TournamentContext';

import { useTeamProfile } from '@/hooks/useTeamProfile';

import EmptyState from '../feedback/EmptyState';
import ErrorState from '../feedback/ErrorState';
import TeamProfileHeader from './TeamProfileHeader';
import TeamProfileSkeleton from './TeamProfileSkeleton';
import TeamStageSummary from './TeamStageSummary';

interface TeamProfileContentProps {
  teamId: number;
}

const TeamProfileContent = ({ teamId }: TeamProfileContentProps) => {
  const { selectedTournamentId, error: tournamentError } = useTournament();

  const {
    teamProfile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: profileRefetch,
    canRetry,
  } = useTeamProfile({
    tournament_id: selectedTournamentId,
    team_id: teamId,
  });

  // display loading and error states before rendering contents

  if (isProfileLoading) {
    return <TeamProfileSkeleton />;
  }

  if (profileError) {
    return (
      <ErrorState
        title="Profile Unavailable"
        description={profileError.message}
        onAction={canRetry ? () => profileRefetch(Boolean(tournamentError)) : undefined}
      />
    );
  }

  if (teamProfile === null) {
    return <ErrorState title="Profile Unavailable" description="Team profile not found." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <TeamProfileHeader teamProfile={teamProfile} />

      {teamProfile.standing ? (
        <TeamStageSummary standing={teamProfile.standing} />
      ) : (
        <EmptyState
          title="No group stage summary yet"
          description="This team does not have standings data for the selected tournament."
        />
      )}
    </div>
  );
};

export default TeamProfileContent;
