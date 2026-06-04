import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import EmptyState from '../feedback/EmptyState';
import MatchTimelineSkeleton from './MatchTimelineSkeleton';
import TimelineEvent from './TimelineEvent';
import TimelineMarker from './TimelineMarker';

import { addScoresToEvents } from '@/utils/matchEvents/EventCardHelper';
import {
  buildTimelineItems,
  getEventKey,
  getPreviousEventMinute,
} from '@/utils/matchEvents/matchEventHelper';

interface MatchTimelineProps {
  isLoading: boolean;
  match: Match;
  events: MatchEvent[];
  emptyState: string | null;
}

function MatchTimeline({ isLoading, match, events, emptyState }: MatchTimelineProps) {
  if (isLoading) {
    return <MatchTimelineSkeleton />;
  }

  if (emptyState) {
    return <EmptyState title="" description={emptyState} />;
  }

  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute);
  const eventsWithScores = addScoresToEvents(sortedEvents, match);

  const timelineItems = buildTimelineItems(eventsWithScores, match.elapsed);

  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 h-full w-px bg-border" />

      {timelineItems.map((item, index) =>
        item.type === 'event' ? (
          <TimelineEvent
            key={getEventKey(item.event)}
            event={item.event}
            match={match}
            score={item.score}
            previousMinute={getPreviousEventMinute(timelineItems, index)}
          />
        ) : (
          <TimelineMarker key={item.label} label={item.label} minute={item.minute} />
        ),
      )}
    </div>
  );
}

export default MatchTimeline;
