import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MatchEvent, MatchEventsResponse } from '@/types/matchEvent';
import type { ResponseMetadata } from '@/types/metadata';

import { apiGet } from './client';
import { getMatchEvents } from './matchEventsApi';
import { isPlayerSummary } from './playersApi';
import { isTeamSummary } from './teamsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

vi.mock('./teamsApi', () => ({
  isTeamSummary: vi.fn(),
}));

vi.mock('./playersApi', () => ({
  isPlayerSummary: vi.fn(),
}));

const mockApiGet = vi.mocked(apiGet);
const mockIsTeamSummary = vi.mocked(isTeamSummary);
const mockIsPlayerSummary = vi.mocked(isPlayerSummary);

const validTeam = {
  id: 1,
  name: 'Belgium',
  short_name: 'BEL',
  logo_url: 'https://media.api-sports.io/football/teams/1.png',
};

const validPlayer = {
  id: 10,
  first_name: 'Kevin',
  last_name: 'De Bruyne',
  photo_url: null,
};

const validMetadata: ResponseMetadata = {
  is_delayed: false,
  last_updated: '2026-06-07T12:00:00Z',
  last_successful_refresh: '2026-06-07T11:58:00Z',
  message: null,
};

function createMatchEvent(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return {
    team: validTeam,
    player: validPlayer,
    secondary_player: {
      id: 20,
      first_name: 'Romelu',
      last_name: 'Lukaku',
      photo_url: null,
    },
    event_type: 'goal',
    minute: 24,
    extra_minute: 2,
    detail: 'Normal Goal',
    comments: 'right footed shot',
    player_name: 'Kevin De Bruyne',
    secondary_player_name: 'Romelu Lukaku',
    player_external_id: 123,
    secondary_player_external_id: 456,
    ...overrides,
  } as MatchEvent;
}

function createRawMatchEvent(overrides: Record<string, unknown> = {}) {
  return {
    ...createMatchEvent(),
    ...overrides,
  };
}

function createMatchEventsResponse(
  overrides: Partial<MatchEventsResponse> = {},
): MatchEventsResponse {
  return {
    data: [createMatchEvent()],
    metadata: validMetadata,
    ...overrides,
  };
}

function createRawMatchEventsResponse(overrides: Record<string, unknown> = {}) {
  return {
    ...createMatchEventsResponse(),
    ...overrides,
  };
}

async function expectInvalidMatchEventsResponse(response: unknown) {
  mockApiGet.mockResolvedValueOnce(response);

  await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
}

describe('getMatchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsTeamSummary.mockReturnValue(true);
    mockIsPlayerSummary.mockReturnValue(true);
  });

  it('calls the match events endpoint with the provided match id', async () => {
    mockApiGet.mockResolvedValueOnce(createMatchEventsResponse({ data: [] }));

    await getMatchEvents({ match_id: 9 });

    expect(mockApiGet).toHaveBeenCalledOnce();
    expect(mockApiGet).toHaveBeenCalledWith('/matches/9/events');
  });

  it('returns the match events response when the API response is valid', async () => {
    const response = createMatchEventsResponse();

    mockApiGet.mockResolvedValueOnce(response);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(response);
  });

  it('accepts an empty match events data array with metadata', async () => {
    const response = createMatchEventsResponse({ data: [] });

    mockApiGet.mockResolvedValueOnce(response);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(response);
  });

  it('accepts required nullable event fields when they are null', async () => {
    const eventWithNulls = createMatchEvent({
      player: null,
      secondary_player: null,
      extra_minute: null,
      detail: null,
      comments: null,
      player_name: null,
      secondary_player_name: null,
      player_external_id: null,
      secondary_player_external_id: null,
    });
    const response = createMatchEventsResponse({ data: [eventWithNulls] });

    mockApiGet.mockResolvedValueOnce(response);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(response);
  });

  it('accepts nullable metadata fields when they are null', async () => {
    const response = createMatchEventsResponse({
      metadata: {
        is_delayed: true,
        last_updated: null,
        last_successful_refresh: null,
        message: null,
      },
    });

    mockApiGet.mockResolvedValueOnce(response);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(response);
  });

  it('accepts a delayed metadata message', async () => {
    const response = createMatchEventsResponse({
      metadata: {
        is_delayed: true,
        last_updated: null,
        last_successful_refresh: '2026-06-07T11:58:00Z',
        message: 'Live match events may be delayed because the latest refresh failed.',
      },
    });

    mockApiGet.mockResolvedValueOnce(response);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(response);
  });

  it('validates the nested team through isTeamSummary', async () => {
    const event = createMatchEvent();

    mockApiGet.mockResolvedValueOnce(createMatchEventsResponse({ data: [event] }));

    await getMatchEvents({ match_id: 1 });

    expect(mockIsTeamSummary).toHaveBeenCalledOnce();
    expect(mockIsTeamSummary).toHaveBeenCalledWith(validTeam);
  });

  it('validates non-null nested players through isPlayerSummary', async () => {
    const event = createMatchEvent();

    mockApiGet.mockResolvedValueOnce(createMatchEventsResponse({ data: [event] }));

    await getMatchEvents({ match_id: 1 });

    expect(mockIsPlayerSummary).toHaveBeenCalledTimes(2);
    expect(mockIsPlayerSummary).toHaveBeenNthCalledWith(1, event.player);
    expect(mockIsPlayerSummary).toHaveBeenNthCalledWith(2, event.secondary_player);
  });

  it('does not validate null players through isPlayerSummary', async () => {
    const event = createMatchEvent({
      player: null,
      secondary_player: null,
    });

    mockApiGet.mockResolvedValueOnce(createMatchEventsResponse({ data: [event] }));

    await getMatchEvents({ match_id: 1 });

    expect(mockIsPlayerSummary).not.toHaveBeenCalled();
  });

  it('rejects the old array-only response shape', async () => {
    await expectInvalidMatchEventsResponse([createMatchEvent()]);
  });

  it('rejects a non-object response', async () => {
    await expectInvalidMatchEventsResponse('not an object');
  });

  it('rejects a response with missing data', async () => {
    await expectInvalidMatchEventsResponse(createRawMatchEventsResponse({ data: undefined }));
  });

  it('rejects a response with non-array data', async () => {
    await expectInvalidMatchEventsResponse(
      createRawMatchEventsResponse({ data: { 0: createMatchEvent() } }),
    );
  });

  it('rejects a response with missing metadata', async () => {
    await expectInvalidMatchEventsResponse(createRawMatchEventsResponse({ metadata: undefined }));
  });

  it('rejects a response with null metadata', async () => {
    await expectInvalidMatchEventsResponse(createRawMatchEventsResponse({ metadata: null }));
  });

  it.each([
    ['is_delayed', null],
    ['is_delayed', 'false'],
    ['last_updated', undefined],
    ['last_updated', 123],
    ['last_successful_refresh', undefined],
    ['last_successful_refresh', 123],
    ['message', undefined],
    ['message', 123],
  ])('rejects metadata when %s is invalid', async (field, value) => {
    await expectInvalidMatchEventsResponse(
      createRawMatchEventsResponse({
        metadata: {
          ...validMetadata,
          [field]: value,
        },
      }),
    );
  });

  it('rejects a response containing null instead of an event', async () => {
    await expectInvalidMatchEventsResponse(createMatchEventsResponse({ data: [null as never] }));
  });

  it('rejects a response containing a primitive instead of an event', async () => {
    await expectInvalidMatchEventsResponse(createMatchEventsResponse({ data: ['goal' as never] }));
  });

  it.each([
    ['player', undefined],
    ['secondary_player', undefined],
    ['player_name', undefined],
    ['secondary_player_name', undefined],
    ['player_external_id', undefined],
    ['secondary_player_external_id', undefined],
    ['extra_minute', undefined],
    ['detail', undefined],
    ['comments', undefined],
  ])('rejects an event when nullable field %s is undefined', async (field, value) => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({ data: [createRawMatchEvent({ [field]: value }) as MatchEvent] }),
    );
  });

  it.each([
    ['player_name', 123],
    ['secondary_player_name', 123],
    ['detail', 1],
    ['comments', 1],
  ])('rejects an event when nullable string field %s has the wrong type', async (field, value) => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({ data: [createRawMatchEvent({ [field]: value }) as MatchEvent] }),
    );
  });

  it.each([
    ['player_external_id', '123'],
    ['secondary_player_external_id', '456'],
    ['extra_minute', '2'],
  ])('rejects an event when nullable number field %s has the wrong type', async (field, value) => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({ data: [createRawMatchEvent({ [field]: value }) as MatchEvent] }),
    );
  });

  it('rejects an event when event_type is missing', async () => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({
        data: [createRawMatchEvent({ event_type: undefined }) as MatchEvent],
      }),
    );
  });

  it('rejects an event when event_type is null', async () => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({
        data: [createRawMatchEvent({ event_type: null }) as MatchEvent],
      }),
    );
  });

  it('rejects an event when event_type is not one of the supported values', async () => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({
        data: [createRawMatchEvent({ event_type: 'banana_card' }) as MatchEvent],
      }),
    );
  });

  it('accepts each supported event type', async () => {
    const eventTypes: MatchEvent['event_type'][] = [
      'goal',
      'own_goal',
      'penalty_goal',
      'penalty_miss',
      'yellow_card',
      'red_card',
      'substitution',
      'var',
      'other',
    ];
    const events = eventTypes.map((eventType) => createMatchEvent({ event_type: eventType }));
    const response = createMatchEventsResponse({ data: events });

    mockApiGet.mockResolvedValueOnce(response);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(response);
  });

  it('rejects an event when minute is missing', async () => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({
        data: [createRawMatchEvent({ minute: undefined }) as MatchEvent],
      }),
    );
  });

  it('rejects an event when minute is not a number', async () => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({ data: [createRawMatchEvent({ minute: '24' }) as MatchEvent] }),
    );
  });

  it('rejects the whole response when any event in the array is invalid', async () => {
    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({
        data: [createMatchEvent(), createRawMatchEvent({ minute: '24' }) as MatchEvent],
      }),
    );
  });

  it('rejects an event when team validation fails', async () => {
    mockIsTeamSummary.mockReturnValue(false);

    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({ data: [createMatchEvent()] }),
    );
  });

  it('rejects an event when player validation fails', async () => {
    mockIsPlayerSummary.mockReturnValue(false);

    await expectInvalidMatchEventsResponse(
      createMatchEventsResponse({ data: [createMatchEvent()] }),
    );
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Network error');
  });
});
