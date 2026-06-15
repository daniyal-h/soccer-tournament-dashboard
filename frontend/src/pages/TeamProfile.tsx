import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ErrorState from '@/components/feedback/ErrorState';
import TeamProfileContent from '@/components/teamProfile/TeamProfileContent';
import { Button } from '@/components/ui/button';

import { ROUTES } from '@/constants/navigation';

import { getBackLabel } from '@/utils/navigationHelper';

interface TeamProfileLocationState {
  from?: unknown;
}

const TeamProfile = () => {
  const location = useLocation();

  const state = location.state as TeamProfileLocationState | null;

  const navigate = useNavigate();
  const from = typeof state?.from === 'string' ? state.from : ROUTES.TEAMS;
  const backLabel = getBackLabel(from);

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
    <div className="flex flex-col gap-4">
      <Button variant="outline" className="w-fit cursor-pointer" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to {backLabel}
      </Button>

      <TeamProfileContent teamId={parsedTeamId} />
    </div>
  );
};

export default TeamProfile;
