import type { MatchEvent, MatchEventsOptions, MatchEventsResponse } from '@/types/matchEvent';
import type { ResponseMetadata } from '@/types/metadata';

import { VALID_EVENT_TYPES } from '@/constants/matchEvents';

import { apiGet } from './client';
import { isPlayerSummary } from './playersApi';
import { isTeamSummary } from './teamsApi';

function isNullablePlayerSummary(value: unknown) {
  return value === null || (value !== undefined && isPlayerSummary(value));
}

function isMatchEvent(value: unknown): value is MatchEvent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const event = value as MatchEvent;

  return (
    isTeamSummary(event.team) &&
    isNullablePlayerSummary(event.player) &&
    isNullablePlayerSummary(event.secondary_player) &&
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

function isResponseMetadata(value: unknown): value is ResponseMetadata {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const metadata = value as ResponseMetadata;

  return (
    typeof metadata.is_delayed === 'boolean' &&
    (metadata.last_updated === null || typeof metadata.last_updated === 'string') &&
    (metadata.last_successful_refresh === null ||
      typeof metadata.last_successful_refresh === 'string') &&
    (metadata.message === null || typeof metadata.message === 'string')
  );
}

function isMatchEventsResponse(value: unknown): value is MatchEventsResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as MatchEventsResponse;

  return (
    Array.isArray(response.data) &&
    response.data.every(isMatchEvent) &&
    isResponseMetadata(response.metadata)
  );
}

export async function getMatchEvents({ match_id }: MatchEventsOptions) {
  const path = `/matches/${match_id}/events`;

  const data = await apiGet<MatchEventsResponse>(path);

  if (!isMatchEventsResponse(data)) {
    throw new Error('Invalid match events response');
  }

  return data;
}
