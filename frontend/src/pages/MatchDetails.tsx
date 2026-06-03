import { useParams } from 'react-router-dom';

import ErrorState from '@/components/feedback/ErrorState';
import MatchDetailsContent from '@/components/matchEvents/MatchDetailsContent';

const MatchDetails = () => {
  const { matchId } = useParams();

  const parsedMatchId = Number(matchId);
  const isValidMatchId = Number.isInteger(parsedMatchId) && parsedMatchId > 0;

  if (!isValidMatchId) {
    return <ErrorState title="Match Unavailable" description="Invalid match ID." />;
  }

  return <MatchDetailsContent matchId={parsedMatchId} />;
};

export default MatchDetails;
