import type { MatchEvent, MatchEventsOptions } from '@/types/matchEvent';

import { apiGet } from './client';

function isTeamSummary(value: unknown): value is MatchEvent['team'] {
  const team = value as MatchEvent['team'];

  return (
    typeof value === 'object' &&
    value !== null &&
    typeof team.id === 'number' &&
    typeof team.name === 'string' &&
    typeof team.short_name === 'string' &&
    (team.logo_url == null || typeof team.logo_url === 'string')
  );
}

function isMatchEvent(value: unknown): value is MatchEvent {
  const event = value as MatchEvent;

  return (
    typeof value === 'object' &&
    value !== null &&
    isTeamSummary(event.team) &&
    typeof event.event_type === 'string' &&
    typeof event.minute === 'number' &&
    (event.extra_minute == null || typeof event.extra_minute === 'number') &&
    (event.detail == null || typeof event.detail === 'string') &&
    (event.comments == null || typeof event.comments === 'string') &&
    (event.player_name == null || typeof event.player_name === 'string') &&
    (event.secondary_player_name == null || typeof event.secondary_player_name === 'string') &&
    (event.player_external_id == null || typeof event.player_external_id === 'number') &&
    (event.secondary_player_external_id == null ||
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
