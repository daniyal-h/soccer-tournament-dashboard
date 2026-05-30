import { Card, CardContent } from '@/components/ui/card';

import { type Match } from '@/types/matches';

import MatchStatusBadge from './MatchStatusBadge';

import { getMatchCenterDisplay, getMatchMetaDisplay } from '@/utils/schedule/matchCardHelper';

interface MatchCardProps {
  match: Match;
}

const MatchCard = ({ match }: MatchCardProps) => {
  return (
    <Card className="w-full shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-col items-center gap-4">
          {/* match status badge */}
          <MatchStatusBadge status={match.status} elapsed={match.elapsed} />

          {/* teams, score/time */}
          <div className="grid w-fit grid-cols-[auto_auto_auto] items-center gap-4">
            {/* team A details */}
            <div className="flex items-center gap-2">
              <span>{match.team_a.name}</span>

              <img
                src={match.team_a.logo_url}
                alt={match.team_a.name}
                className="h-6 w-6 shrink-0 object-contain"
              />
            </div>

            {/* time, score or special status */}
            <span className="text-center">{getMatchCenterDisplay(match)}</span>

            {/* team B details */}
            <div className="flex items-center gap-2">
              <img
                src={match.team_b.logo_url}
                alt={match.team_b.name}
                className="h-6 w-6 shrink-0 object-contain"
              />
              <span>{match.team_b.name}</span>
            </div>
          </div>

          {/* stage and venue */}
          <p className="text-sm text-muted-foreground">{getMatchMetaDisplay(match)}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchCard;
