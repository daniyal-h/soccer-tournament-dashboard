import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Card, CardContent } from '@/components/ui/card';

import { type Match } from '@/types/match';

import { ROUTES } from '@/constants/navigation';

import { cn } from '@/lib/utils';

import MatchCenter from './MatchCenter';
import MatchStatusBadge from './MatchStatusBadge';
import ResponsiveTeamName from './ResponsiveTeamName';

import { getMatchMetaDisplay, getWinnerSide } from '@/utils/matches/matchCardHelper';

interface MatchCardProps {
  match: Match;
  variant?: 'default' | 'nested';
  from?: string;
}

const MatchCard = ({ match, variant = 'default', from = ROUTES.SCHEDULE }: MatchCardProps) => {
  const winner = getWinnerSide(match);

  return (
    <Link
      to={`/matches/${match.id}`}
      state={{ from: from }}
      style={{ textDecoration: 'none' }}
      className="block min-w-0"
    >
      <Card
        className={cn(
          'relative w-full cursor-pointer shadow-sm transition-all active:scale-[0.98]',
          variant === 'default' && 'hover:bg-accent hover:shadow-md active:bg-accent',
          variant === 'nested' &&
            'bg-background/70 shadow-none hover:bg-background hover:shadow-sm active:bg-background',
        )}
      >
        <CardContent className="min-w-0 space-y-3 p-4">
          <div className="flex flex-col items-center gap-4">
            {/* match status badge */}
            <MatchStatusBadge status={match.status} elapsed={match.elapsed} />

            {/* teams, score/time */}
            <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center">
              {/* team A details */}
              <div className="flex items-center justify-end gap-2 pl-8 min-w-0">
                <ResponsiveTeamName
                  name={match.team_a.name}
                  shortName={match.team_a.short_name}
                  className={cn(
                    winner === 'team_a' && 'font-semibold',
                    winner && winner !== 'team_a' && 'text-muted-foreground',
                  )}
                />

                {match.team_a.logo_url && (
                  <img
                    src={match.team_a.logo_url}
                    alt={match.team_a.name}
                    className="h-6 w-6 shrink-0 object-contain"
                  />
                )}
              </div>

              {/* time, score or special status */}
              <div className="px-4 text-center">
                <MatchCenter match={match} />
              </div>

              {/* team B details */}
              <div className="flex items-center justify-start gap-2 pr-8 min-w-0">
                {match.team_b.logo_url && (
                  <img
                    src={match.team_b.logo_url}
                    alt={match.team_b.name}
                    className="h-6 w-6 shrink-0 object-contain"
                  />
                )}
                <ResponsiveTeamName
                  name={match.team_b.name}
                  shortName={match.team_b.short_name}
                  className={cn(
                    winner === 'team_b' && 'font-semibold',
                    winner && winner !== 'team_b' && 'text-muted-foreground',
                  )}
                />
              </div>
            </div>

            {/* stage and venue */}
            <p className="max-w-full truncate text-sm text-muted-foreground">
              {getMatchMetaDisplay(match)}
            </p>
          </div>
        </CardContent>
        {/* Affordance for clickability */}
        <ChevronRight className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
      </Card>
    </Link>
  );
};

export default MatchCard;
