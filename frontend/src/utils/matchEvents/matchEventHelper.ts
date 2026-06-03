import type { MatchEvent } from '@/types/matchEvents';

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
