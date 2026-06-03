import type { Match } from '@/types/match';

import { getMatchCenterDisplay } from '@/utils/matches/matchCardHelper';

/**
 * Dynamically render the center to be based on the status.
 * Score is only shown for live or finished matches.
 * If penalties occurred, inline under the score.
 */
function MatchCenter({ match }: { match: Match }) {
  const hasPenalties = match.team_a_penalties != null && match.team_b_penalties != null;

  if (match.status === 'finished' && hasPenalties) {
    return (
      <div className="flex flex-col items-center">
        <span>
          {match.team_a_score} - {match.team_b_score}
        </span>
        <span className="text-xs text-muted-foreground">
          Pens: {match.team_a_penalties} - {match.team_b_penalties}
        </span>
      </div>
    );
  }

  return <span>{getMatchCenterDisplay(match)}</span>;
}

export default MatchCenter;
