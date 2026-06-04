import { motion } from 'motion/react';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import EventCard from './EventCard';

import { calculateTimeGap } from '@/utils/matchEvents/matchEventHelper';

interface TimelineEventProps {
  event: MatchEvent;
  match: Match;
  previousMinute?: number;
  score: string;
}

const TimelineEvent = ({ event, match, previousMinute, score }: TimelineEventProps) => {
  const isLeftSide = event.team.id === match.team_a.id;

  const gap = calculateTimeGap(event.minute, previousMinute);

  return (
    <motion.div
      style={{ marginTop: gap }}
      className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="flex min-w-0 justify-end">
        {isLeftSide && <EventCard event={event} score={score} />}
      </div>

      <div className="z-10 flex justify-center">
        <div className="hidden rounded-full border bg-background px-3 py-2 min-[500px]:block">
          {event.minute}'
        </div>
      </div>

      <div className="flex min-w-0 justify-start">
        {!isLeftSide && <EventCard event={event} score={score} />}
      </div>
    </motion.div>
  );
};

export default TimelineEvent;
