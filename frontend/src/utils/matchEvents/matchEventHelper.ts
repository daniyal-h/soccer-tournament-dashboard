import type { Match } from '@/types/match';
import type { MatchEvent, TimelineItem, TimelineMarkerConfig } from '@/types/matchEvent';

import {
  MAX_TIMELINE_EVENT_GAP_PX,
  MIN_TIMELINE_EVENT_GAP_PX,
  PENALTY_SHOOTOUT_COMMENT,
  TIMELINE_MARKERS,
  TIMELINE_PIXELS_PER_5_MINUTES,
} from '@/constants/matchEvents';

/**
 * Return a unique key based on the attributes of an event
 */
export function getEventKey(event: MatchEvent) {
  return [
    event.minute,
    event.team.name,
    event.player?.last_name ?? '',
    event.event_type,
    event.secondary_player?.last_name ?? '',
  ].join('-');
}

/**
 * Given events and their scores.
 * Return timeline items which include are API-returned events and timeline markers.
 * Order events to maintain a chronological timeline.
 * Return a sorted list of events in time and order.
 */
export function buildTimelineItems(
  eventsWithScores: { event: MatchEvent; score: string }[],
  match: Match,
): TimelineItem[] {
  // map all API-returned events with their score and order of 1
  // penalty shootouts are order of 2
  const eventItems: TimelineItem[] = eventsWithScores.map(({ event, score }) => ({
    type: 'event',
    minute: event.minute,
    order: isPenaltyShootoutEvent(event) ? 2 : 0,
    event,
    score,
  }));

  // get all timeline markers (half-time, full-time, extra-time, etc.)
  // grant all order of 1
  const markerItems: TimelineItem[] = getTimelineMarkers(
    match,
    eventsWithScores.map(({ event }) => event),
  ).map((marker) => ({
    type: 'marker',
    minute: marker.minute,
    order: marker.order ?? 0,
    label: marker.label,
  }));

  // sort first by time, then by order
  return [...eventItems, ...markerItems].sort((a, b) => {
    if (a.minute !== b.minute) {
      return a.minute - b.minute;
    }

    return a.order - b.order;
  });
}

/**
 * Given a match and its events, return the timeline markers.
 * Markers occur at set points in a game, but are limited by the elapsed time.
 */
function getTimelineMarkers(match: Match, events: MatchEvent[]): TimelineMarkerConfig[] {
  // default to no markers if elapsed is not given
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

  // include penalty shootout markers if shootouts occurred
  const hasPenaltyShootout = events.some(isPenaltyShootoutEvent);

  if (hasPenaltyShootout) {
    markers.push(TIMELINE_MARKERS.PENALTY_SHOOTOUT, TIMELINE_MARKERS.END_OF_SHOOTOUT);
  }

  return markers;
}

export function isPenaltyShootoutEvent(event: MatchEvent) {
  return event.comments === PENALTY_SHOOTOUT_COMMENT;
}

// return the previous event's minute
export function getPreviousEventMinute(items: TimelineItem[], index: number) {
  for (let i = index - 1; i >= 0; i--) {
    if (items[i].type === 'event') {
      return items[i].minute;
    }
  }

  return undefined;
}

/**
 * Calculate the gap in time between two event times.
 * Return the gap the timeline should show for proportional timeline generation.
 * Floor and ceiling to defined constants.
 */
export function calculateTimeGap(currentMinute: number, previousMinute?: number): number {
  if (previousMinute === undefined) {
    return MIN_TIMELINE_EVENT_GAP_PX;
  }

  const minuteDifference = Math.max(currentMinute - previousMinute, 0);

  const proportionalGap = (minuteDifference / 5) * TIMELINE_PIXELS_PER_5_MINUTES;

  return Math.min(Math.max(proportionalGap, MIN_TIMELINE_EVENT_GAP_PX), MAX_TIMELINE_EVENT_GAP_PX);
}
