import type { EventType, MatchEvent, MatchEventsOptions } from '@/types/matchEvent';

import { VALID_EVENT_TYPES } from '@/constants/matchEvents';

import { apiGet } from './client';
import { isTeam } from './teamsApi';

function isEventType(value: unknown): value is EventType {
  return typeof value === 'string' && VALID_EVENT_TYPES.has(value as EventType);
}

function isNullableObject(value: unknown): value is object | null {
  return value === null || (typeof value === 'object' && value !== null);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isNullableNumber(value: unknown): value is number | null {
  return typeof value === 'number' || value === null;
}

function isMatchEvent(value: unknown): value is MatchEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as MatchEvent;

  return (
    isTeam(event.team) &&
    isNullableObject(event.player) &&
    isNullableObject(event.secondary_player) &&
    isNullableString(event.player_name) &&
    isNullableString(event.secondary_player_name) &&
    isNullableNumber(event.player_external_id) &&
    isNullableNumber(event.secondary_player_external_id) &&
    isEventType(event.event_type) &&
    typeof event.minute === 'number' &&
    isNullableNumber(event.extra_minute) &&
    isNullableString(event.detail) &&
    isNullableString(event.comments)
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
