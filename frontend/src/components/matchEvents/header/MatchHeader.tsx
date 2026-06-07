import { Card } from '@/components/ui/card';

import type { Match } from '@/types/match';
import type { ResponseMetadata } from '@/types/metadata';

import MatchStatusBadge from '../../matches/MatchStatusBadge';

import { formatMatchDate, formatStage, getScoreText } from '@/utils/matchEvents/matchHeaderHelper';

interface MatchHeaderProps {
  match: Match;
  metadata: ResponseMetadata;
}

function getRelativeTime(timestamp: string) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;

  const elapsed = new Date(timestamp).getTime() - Date.now(); // Negative if in the past
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(elapsed) < msPerMinute) {
    return rtf.format(Math.round(elapsed / 1000), 'second');
  } else if (Math.abs(elapsed) < msPerHour) {
    return rtf.format(Math.round(elapsed / msPerMinute), 'minute');
  } else if (Math.abs(elapsed) < msPerDay) {
    return rtf.format(Math.round(elapsed / msPerHour), 'hour');
  } else {
    return rtf.format(Math.round(elapsed / msPerDay), 'day');
  }
}

const MatchHeader = ({ match, metadata }: MatchHeaderProps) => {
  const hasPenalties = match.team_a_penalties != null && match.team_b_penalties != null;
  const displayedLastUpdated = metadata.last_updated ?? metadata.last_successful_refresh

  return (
    <Card className="mb-10 p-6 text-center shadow-sm">
      {/* Top-level badge based on match status */}
      <div className="mb-5 flex flex-col items-center gap-2">
        <MatchStatusBadge status={match.status} elapsed={match.elapsed} />

        <p className="text-sm text-muted-foreground">{formatStage(match)}</p>
      </div>

      {/* Main central display with team details and score */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-8">
        <div className="flex min-w-0 flex-col items-end gap-2">
          {match.team_a.logo_url && (
            <img
              src={match.team_a.logo_url}
              alt={`${match.team_a.name} logo`}
              className="h-10 w-10 object-contain"
            />
          )}

          <div className="min-w-0 max-w-full text-right">
            <p className="truncate text-lg font-bold sm:text-2xl">{match.team_a.name}</p>
            <p className="text-sm text-muted-foreground">{match.team_a.short_name}</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <p className="text-3xl font-black sm:text-5xl">{getScoreText(match)}</p>

          {hasPenalties && (
            <p className="mt-1 text-sm font-medium text-muted-foreground">
              ({match.team_a_penalties} - {match.team_b_penalties} pens)
            </p>
          )}
        </div>

        <div className="flex min-w-0 flex-col items-start gap-2">
          {match.team_b.logo_url && (
            <img
              src={match.team_b.logo_url}
              alt={`${match.team_b.name} logo`}
              className="h-10 w-10 object-contain"
            />
          )}

          <div className="min-w-0 max-w-full text-left">
            <p className="truncate text-lg font-bold sm:text-2xl">{match.team_b.name}</p>
            <p className="text-sm text-muted-foreground">{match.team_b.short_name}</p>
          </div>
        </div>
      </div>

      {/* Footer with extra details (venue, date, time, freshness) */}
      <div className="mt-6 text-sm text-muted-foreground">
        <div className="space-y-1">
          {match.venue && <p>{match.venue}</p>}
          <p>{formatMatchDate(match.kickoff_time)}</p>
        </div>

        {displayedLastUpdated && (
          <div className="mt-4 text-left text-xs">
            <p>Last updated: {getRelativeTime(displayedLastUpdated)}</p>

            {metadata.message && <p className="mt-1 italic">{metadata.message}</p>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default MatchHeader;
