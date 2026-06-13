import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ErrorState from '@/components/feedback/ErrorState';
import { Button } from '@/components/ui/button';

import { ROUTES } from '@/constants/navigation';

const TeamProfile = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const from = location.state?.from ?? ROUTES.TEAMS;

  const handleBack = () => {
    if (from && globalThis.history.length > 1) {
      navigate(-1);
      return;
    }

    if (from) {
      navigate(from);
    }
  };

  const { teamId } = useParams();

  const parsedTeamId = Number(teamId);
  const isValidTeamId = Number.isInteger(parsedTeamId) && parsedTeamId > 0;

  if (!isValidTeamId) {
    return <ErrorState title="Team Profile Unavailable" description="Invalid team ID." />;
  }

  return (
    <section className="space-y-3">
      <Button variant="outline" className="w-fit cursor-pointer" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to Teams
      </Button>
      <h1 className="text-3xl font-bold tracking-tight">Team: {teamId} (coming soon!)</h1>

      <p className="text-muted-foreground">Profile for team: {teamId}</p>
    </section>
  );
};

export default TeamProfile;
