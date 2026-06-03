import { ArrowLeftRight, Goal, RectangleVertical, XCircle } from 'lucide-react';

import type { MatchEvent } from '@/types/matchEvents';
import type { EventType } from '@/types/matchEvents';

import { MAX_TIMELINE_GAP, MIN_TIMELINE_GAP, PIXELS_PER_5_MINUTES } from '@/constants/matchEvents';

export function getEventKey(event: MatchEvent) {
  return [
    event.minute,
    event.team.name,
    event.player?.last_name ?? '',
    event.event_type,
    event.secondary_player?.last_name ?? '',
  ].join('-');
}

export function calculateTimeGap(currentMinute: number, previousMinute?: number): number {
  if (previousMinute === undefined) {
    return MIN_TIMELINE_GAP;
  }

  const minuteDifference = Math.max(currentMinute - previousMinute, 0);

  const proportionalGap = (minuteDifference / 5) * PIXELS_PER_5_MINUTES;

  return Math.min(Math.max(proportionalGap, MIN_TIMELINE_GAP), MAX_TIMELINE_GAP);
}

export function getEventIcon(eventType: EventType) {
  switch (eventType) {
    case 'goal':
    case 'penalty_goal':
      return <Goal className="h-5 w-5 text-green-500" />;

    case 'own_goal':
      return <Goal className="h-5 w-5 text-red-500" />;

    case 'penalty_miss':
      return <XCircle className="h-5 w-5 text-red-500" />;

    case 'yellow_card':
      return <RectangleVertical className="h-5 w-5 fill-yellow-400 text-yellow-400" />;

    case 'red_card':
      return <RectangleVertical className="h-5 w-5 fill-red-500 text-red-500" />;

    case 'substitution':
      return <ArrowLeftRight className="h-5 w-5 text-blue-500" />;
  }
}
