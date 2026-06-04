import type { Match } from '@/types/match';
import type { MatchEvent, TimelineItem, TimelineMarkerConfig } from '@/types/matchEvent';

import {
  MAX_TIMELINE_EVENT_GAP_PX,
  MIN_TIMELINE_EVENT_GAP_PX,
  PENALTY_SHOOTOUT_COMMENT,
  TIMELINE_MARKERS,
  TIMELINE_PIXELS_PER_5_MINUTES,
} from '@/constants/matchEvents';

export function getEventKey(event: MatchEvent) {
  return [
    event.minute,
    event.team.name,
    event.player?.last_name ?? '',
    event.event_type,
    event.secondary_player?.last_name ?? '',
  ].join('-');
}

export function buildTimelineItems(
  eventsWithScores: { event: MatchEvent; score: string }[],
  match: Match,
): TimelineItem[] {
  const eventItems: TimelineItem[] = eventsWithScores.map(({ event, score }) => ({
    type: 'event',
    minute: event.minute,
    order: isPenaltyShootoutEvent(event) ? 2 : 0,
    event,
    score,
  }));

  const markerItems: TimelineItem[] = getTimelineMarkers(
    match,
    eventsWithScores.map(({ event }) => event),
  ).map((marker) => ({
    type: 'marker',
    minute: marker.minute,
    order: marker.order ?? 0,
    label: marker.label,
  }));

  return [...eventItems, ...markerItems].sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }

    return a.order - b.order;
  });
}

function getTimelineMarkers(match: Match, events: MatchEvent[]): TimelineMarkerConfig[] {
  const markers: TimelineMarkerConfig[] = [];

  if (match.elapsed) {
    if (match.elapsed >= TIMELINE_MARKERS.HALF_TIME.minute) {
      markers.push(TIMELINE_MARKERS.HALF_TIME);
    }

    if (match.elapsed >= TIMELINE_MARKERS.END_OF_EXTRA_TIME.minute) {
      markers.push(
        TIMELINE_MARKERS.END_OF_REGULATION,
        TIMELINE_MARKERS.ET_HALF_TIME,
        TIMELINE_MARKERS.END_OF_EXTRA_TIME,
      );
    } else if (match.elapsed >= TIMELINE_MARKERS.FULL_TIME.minute) {
      markers.push(TIMELINE_MARKERS.FULL_TIME);
    }
  }

  const hasPenaltyShootout = events.some(isPenaltyShootoutEvent);

  if (hasPenaltyShootout) {
    markers.push(TIMELINE_MARKERS.PENALTY_SHOOTOUT, TIMELINE_MARKERS.END_OF_SHOOTOUT);
  }

  return markers;
}

export function isPenaltyShootoutEvent(event: MatchEvent) {
  return event.comments === PENALTY_SHOOTOUT_COMMENT;
}

export function getPreviousEventMinute(items: TimelineItem[], index: number) {
  for (let i = index - 1; i >= 0; i--) {
    if (items[i].type === 'event') {
      return items[i].minute;
    }
  }

  return undefined;
}

export function calculateTimeGap(currentMinute: number, previousMinute?: number): number {
  if (previousMinute === undefined) {
    return MIN_TIMELINE_EVENT_GAP_PX;
  }

  const minuteDifference = Math.max(currentMinute - previousMinute, 0);

  const proportionalGap = (minuteDifference / 5) * TIMELINE_PIXELS_PER_5_MINUTES;

  return Math.min(Math.max(proportionalGap, MIN_TIMELINE_EVENT_GAP_PX), MAX_TIMELINE_EVENT_GAP_PX);
}
