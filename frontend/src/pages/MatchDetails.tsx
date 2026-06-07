import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ErrorState from '@/components/feedback/ErrorState';
import MatchDetailsContent from '@/components/matchEvents/MatchDetailsContent';
import { Button } from '@/components/ui/button';

const MatchDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from;

  const handleBack = () => {
    if (from && globalThis.history.length > 1) {
      navigate(-1);
      return;
    }

    if (from) {
      navigate(from);
    }
  };

  const { matchId } = useParams();

  const parsedMatchId = Number(matchId);
  const isValidMatchId = Number.isInteger(parsedMatchId) && parsedMatchId > 0;

  if (!isValidMatchId) {
    return <ErrorState title="Match Unavailable" description="Invalid match ID." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" className="w-fit cursor-pointer" onClick={handleBack}>
        <ArrowLeft className="h-4 w-4" />
        Back to Schedule
      </Button>

      <MatchDetailsContent matchId={parsedMatchId} />
    </div>
  );
};

export default MatchDetails;
