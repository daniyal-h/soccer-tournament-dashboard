import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import EmptyState from '../feedback/EmptyState';
import LoadingState from '../feedback/LoadingState';
import TimelineEvent from './TimelineEvent';

import { addScoresToEvents } from '@/utils/matchEvents/EventCardHelper';
import { getEventKey } from '@/utils/matchEvents/matchEventHelper';

interface MatchTimelineProps {
  isLoading: boolean;
  match: Match;
  events: MatchEvent[];
  emptyState: string | null;
}

function MatchTimeline({ isLoading, match, events, emptyState }: MatchTimelineProps) {
  if (isLoading) {
    return <LoadingState message="Loading events..." />;
  }

  if (emptyState) {
    return <EmptyState title="" description={emptyState} />;
  }

  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);
  const eventsWithScores = addScoresToEvents(sortedEvents, match);

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />

      {eventsWithScores.map(({ event, score }, index) => (
        <TimelineEvent
          key={getEventKey(event)}
          event={event}
          match={match}
          score={score}
          previousMinute={sortedEvents[index - 1]?.minute}
        />
      ))}
    </div>
  );
}

export default MatchTimeline;
