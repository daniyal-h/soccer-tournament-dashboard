import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import TimelineEvent from './TimelineEvent';

import { addScoresToEvents } from '@/utils/matchEvents/EventCardHelper';
import { getEventKey } from '@/utils/matchEvents/matchEventHelper';

interface MatchTimelineProps {
  match: Match;
  events: MatchEvent[];
}

function MatchTimeline({ match, events }: MatchTimelineProps) {
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
