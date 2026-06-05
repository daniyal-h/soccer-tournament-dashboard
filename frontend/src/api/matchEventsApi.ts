import type { MatchEvent, MatchEventsOptions } from '@/types/matchEvent';

import { VALID_EVENT_TYPES } from '@/constants/matchEvents';

import { apiGet } from './client';
import { isPlayerSummary } from './playersApi';
import { isTeam } from './teamsApi';

function isMatchEvent(value: unknown): value is MatchEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as MatchEvent;

  return (
    isTeam(event.team) &&
    (event.player === null || isPlayerSummary(event.player)) &&
    (event.secondary_player === null || isPlayerSummary(event.secondary_player)) &&
    VALID_EVENT_TYPES.has(event.event_type) &&
    typeof event.minute === 'number' &&
    (event.extra_minute === null || typeof event.extra_minute === 'number') &&
    (event.detail === null || typeof event.detail === 'string') &&
    (event.comments === null || typeof event.comments === 'string') &&
    (event.player_name === null || typeof event.player_name === 'string') &&
    (event.secondary_player_name === null || typeof event.secondary_player_name === 'string') &&
    (event.player_external_id === null || typeof event.player_external_id === 'number') &&
    (event.secondary_player_external_id === null ||
      typeof event.secondary_player_external_id === 'number')
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
