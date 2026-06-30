import type { Match } from '@/types/match';

import { getMatchCenterDisplay, getMatchDay } from '@/utils/matches/matchCardHelper';

interface MatchCenterProps {
  match: Match;
  showDateInCenter?: boolean;
}

/**
 * Dynamically render the center to be based on the status.
 * Score is only shown for live or finished matches.
 * If penalties occurred, inline under the score.
 */
function MatchCenter({ match, showDateInCenter }: MatchCenterProps) {
  const hasPenalties =
    (match.status === 'live' || match.status === 'finished') &&
    match.team_a_penalties !== null &&
    match.team_b_penalties !== null;

  const centerDisplay = getMatchCenterDisplay(match);

  if (hasPenalties) {
    return (
      <div className="flex h-10 flex-col items-center justify-center leading-none">
        <span>{centerDisplay}</span>
        <span className="mt-1 text-xs text-muted-foreground">
          Pens: {match.team_a_penalties} - {match.team_b_penalties}
        </span>
      </div>
    );
  }

  return (
    <div className="flex h-10 flex-col items-center justify-center leading-none">
      {showDateInCenter && match.status === 'scheduled' && (
        <span className="mb-1 text-xs text-muted-foreground">{getMatchDay(match)}</span>
      )}
      <span>{centerDisplay}</span>
    </div>
  );
}

export default MatchCenter;
