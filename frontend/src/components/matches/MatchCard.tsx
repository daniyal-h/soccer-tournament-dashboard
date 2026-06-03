import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import { type Match } from '@/types/matches';

import { cn } from '@/lib/utils';

import MatchCenter from './MatchCenter';
import MatchStatusBadge from './MatchStatusBadge';

import { getMatchMetaDisplay, getWinnerSide } from '@/utils/matches/matchCardHelper';

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  const winner = getWinnerSide(match);

  return (
    <Link to={`/matches/${match.id}`} style={{ textDecoration: 'none' }}>
      <Card className="w-full cursor-pointer shadow-sm transition-all hover:bg-accent hover:shadow-md">
        <CardContent className="min-w-0 space-y-3 p-4">
          <div className="flex flex-col items-center gap-4">
            {/* match status badge */}
            <MatchStatusBadge status={match.status} elapsed={match.elapsed} />

            {/* teams, score/time */}
            <div className="grid w-fit grid-cols-[1fr_auto_1fr] items-center">
              {/* team A details */}
              <div className="flex items-center justify-end gap-2 min-w-0">
                <span
                  className={cn(
                    winner === 'team_a' && 'font-semibold',
                    winner && winner !== 'team_a' && 'text-muted-foreground',
                    'truncate',
                  )}
                >
                  {match.team_a.name}
                </span>

                <img
                  src={match.team_a.logo_url}
                  alt={match.team_a.name}
                  className="h-6 w-6 shrink-0 object-contain"
                />
              </div>

              {/* time, score or special status */}
              <div className="px-4 text-center">
                <MatchCenter match={match} />
              </div>

              {/* team B details */}
              <div className="flex items-center justify-start gap-2 min-w-0">
                <img
                  src={match.team_b.logo_url}
                  alt={match.team_b.name}
                  className="h-6 w-6 shrink-0 object-contain"
                />
                <span
                  className={cn(
                    winner === 'team_b' && 'font-semibold',
                    winner && winner !== 'team_b' && 'text-muted-foreground',
                    'truncate',
                  )}
                >
                  {match.team_b.name}
                </span>
              </div>
            </div>

            {/* stage and venue */}
            <p className="max-w-full truncate text-sm text-muted-foreground">
              {getMatchMetaDisplay(match)}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default MatchCard;
