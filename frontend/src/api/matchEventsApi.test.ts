import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MatchEvent } from '@/types/matchEvent';

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

async function expectInvalidMatchEventResponse(response: unknown) {
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
    mockApiGet.mockResolvedValueOnce([]);

    await getMatchEvents({ match_id: 9 });

    expect(mockApiGet).toHaveBeenCalledOnce();
    expect(mockApiGet).toHaveBeenCalledWith('/matches/9/events');
  });

  it('returns match events when the API response is valid', async () => {
    const event = createMatchEvent();

    mockApiGet.mockResolvedValueOnce([event]);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual([event]);
  });

  it('accepts an empty match events response', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual([]);
  });

  it('accepts required nullable fields when they are null', async () => {
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

    mockApiGet.mockResolvedValueOnce([eventWithNulls]);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual([eventWithNulls]);
  });

  it('validates the nested team through isTeam', async () => {
    const event = createMatchEvent();

    mockApiGet.mockResolvedValueOnce([event]);

    await getMatchEvents({ match_id: 1 });

    expect(mockIsTeamSummary).toHaveBeenCalledOnce();
    expect(mockIsTeamSummary).toHaveBeenCalledWith(validTeam);
  });

  it('rejects the event when isTeam rejects the nested team', async () => {
    mockIsTeamSummary.mockReturnValueOnce(false);

    await expectInvalidMatchEventResponse([createMatchEvent()]);
  });

  it('rejects a non-array response', async () => {
    await expectInvalidMatchEventResponse({
      message: 'not an array',
    });
  });

  it('rejects a response containing null instead of an event', async () => {
    await expectInvalidMatchEventResponse([null]);
  });

  it('rejects a response containing a primitive instead of an event', async () => {
    await expectInvalidMatchEventResponse(['goal']);
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
    await expectInvalidMatchEventResponse([createRawMatchEvent({ [field]: value })]);
  });

  it.each([
    ['player_name', 123],
    ['secondary_player_name', 123],
    ['detail', 1],
    ['comments', 1],
  ])('rejects an event when nullable string field %s has the wrong type', async (field, value) => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ [field]: value })]);
  });

  it.each([
    ['player_external_id', '123'],
    ['secondary_player_external_id', '456'],
    ['extra_minute', '2'],
  ])('rejects an event when nullable number field %s has the wrong type', async (field, value) => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ [field]: value })]);
  });

  it('rejects an event when event_type is missing', async () => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ event_type: undefined })]);
  });

  it('rejects an event when event_type is not a string', async () => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ event_type: null })]);
  });

  it('rejects an event when event_type is not one of the supported values', async () => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ event_type: 'banana_card' })]);
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

    mockApiGet.mockResolvedValueOnce(events);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual(events);
  });

  it('rejects an event when minute is missing', async () => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ minute: undefined })]);
  });

  it('rejects an event when minute is not a number', async () => {
    await expectInvalidMatchEventResponse([createRawMatchEvent({ minute: '24' })]);
  });

  it('rejects the whole response when any event in the array is invalid', async () => {
    await expectInvalidMatchEventResponse([
      createMatchEvent(),
      createRawMatchEvent({ minute: '24' }),
    ]);
  });

  it('rejects an event when team validation fails', async () => {
    mockIsTeamSummary.mockReturnValue(false);

    await expectInvalidMatchEventResponse([createMatchEvent()]);
  });

  it('rejects an event when player validation fails', async () => {
    mockIsPlayerSummary.mockReturnValue(false);

    await expectInvalidMatchEventResponse([createMatchEvent()]);
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Network error');
  });
});
