import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import ErrorState from '@/components/feedback/ErrorState';
import MatchDetailsContent from '@/components/matchEvents/MatchDetailsContent';
import { Button } from '@/components/ui/button';

import type { LocationState } from '@/types/navbar';

import { ROUTES } from '@/constants/navigation';

import { getBackLabel } from '@/utils/navigationHelper';

const MatchDetails = () => {
  const location = useLocation();

  const state = location.state as LocationState | null;

  const navigate = useNavigate();
  const from = typeof state?.from === 'string' ? state.from : ROUTES.SCHEDULE;
  const backLabel = getBackLabel(from);

  useEffect(() => {
    // Always scroll to top when this page mounts or the match changes
    const id = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(id);
  }, [location.key]);

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
        Back to {backLabel}
      </Button>

      <MatchDetailsContent matchId={parsedMatchId} />
    </div>
  );
};

export default MatchDetails;
