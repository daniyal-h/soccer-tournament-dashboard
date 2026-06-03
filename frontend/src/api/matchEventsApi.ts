import type { MatchEvent, MatchEventsOptions } from '@/types/matchEvent';

import { apiGet } from './client';

function isMatchEvent(value: unknown): value is MatchEvent {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as MatchEvent).team === 'object' &&
    (value as MatchEvent).team !== null &&
    typeof (value as MatchEvent).event_type === 'string' &&
    typeof (value as MatchEvent).minute === 'number' &&
    ((value as MatchEvent).extra_minute === undefined ||
      typeof (value as MatchEvent).extra_minute === 'number') &&
    ((value as MatchEvent).detail === undefined ||
      typeof (value as MatchEvent).detail === 'string') &&
    ((value as MatchEvent).comments === undefined ||
      typeof (value as MatchEvent).comments === 'string')
  );
}

function isMatchEventsResponse(value: unknown): value is MatchEvent[] {
  return Array.isArray(value) && value.every(isMatchEvent);
}

export async function getMatchEvents({ match_id }: MatchEventsOptions) {
  const path = `/matches/${match_id}/events`;

  const data = await apiGet<MatchEvent[]>(path);

  if (!isMatchEventsResponse(data)) {
    throw new Error('Invalid match events response');
  }

  return data;
}
