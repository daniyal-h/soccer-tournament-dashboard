import type { Match } from '@/types/match';

import { getMatchCenterDisplay } from '@/utils/matches/matchCardHelper';

/**
 * Dynamically render the center to be based on the status.
 * Score is only shown for live or finished matches.
 * If penalties occurred, inline under the score.
 */
function MatchCenter({ match }: { match: Match }) {
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
    <div className="flex h-10 items-center justify-center">
      <span>{centerDisplay}</span>
    </div>
  );
}

export default MatchCenter;
