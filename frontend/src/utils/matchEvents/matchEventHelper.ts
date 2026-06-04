import type { MatchEvent, TimelineItem } from '@/types/matchEvent';

import {
  MAX_TIMELINE_EVENT_GAP_PX,
  MIN_TIMELINE_EVENT_GAP_PX,
  TIMELINE_PIXELS_PER_5_MINUTES,
} from '@/constants/matchEvents';

interface TimelineMarkerConfig {
  minute: number;
  label: string;
}

function getTimelineMarkers(elapsed: number | null): TimelineMarkerConfig[] {
  if (elapsed == null) {
    return [];
  }

  if (elapsed >= 120) {
    return [
      { minute: 45, label: 'HALF TIME' },
      { minute: 90, label: 'END OF REGULATION' },
      { minute: 105, label: 'ET HALF TIME' },
      { minute: 120, label: 'FULL TIME' },
    ];
  }

  if (elapsed >= 90) {
    return [
      { minute: 45, label: 'HALF TIME' },
      { minute: 90, label: 'FULL TIME' },
    ];
  }

  if (elapsed >= 45) {
    return [{ minute: 45, label: 'HALF TIME' }];
  }

  return [];
}

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
  elapsed?: number,
): TimelineItem[] {
  const eventItems: TimelineItem[] = eventsWithScores.map(({ event, score }) => ({
    type: 'event',
    minute: event.minute,
    event,
    score,
  }));

  let markerItems: TimelineItem[] = [];

  if (elapsed) {
    markerItems = getTimelineMarkers(elapsed).map((marker) => ({
      type: 'marker',
      minute: marker.minute,
      label: marker.label,
    }));
  }

  return [...eventItems, ...markerItems].sort((a, b) => a.minute - b.minute);
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
