import { useParams } from 'react-router-dom';

import ErrorState from '@/components/feedback/ErrorState';

const TeamProfile = () => {
  const { teamId } = useParams();

  const parsedTeamId = Number(teamId);
  const isValidTeamId = Number.isInteger(parsedTeamId) && parsedTeamId > 0;

  if (!isValidTeamId) {
    return <ErrorState title="Team Profile Unavailable" description="Invalid team ID." />;
  }

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold tracking-tight">Team: {teamId} (coming soon!)</h1>

      <p className="text-muted-foreground">Profile for team: {teamId}</p>
    </section>
  );
};

export default TeamProfile;
