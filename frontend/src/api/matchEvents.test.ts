import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MatchEvent } from '@/types/matchEvent';

import { apiGet } from './client';
import { getMatchEvents } from './MatchEventsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

const mockApiGet = vi.mocked(apiGet);

const validMatchEvent: MatchEvent = {
  team: {
    id: 1,
    name: 'Belgium',
    short_name: 'BEL',
    logo_url: 'https://media.api-sports.io/football/teams/1.png',
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
};

describe('getMatchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the match events endpoint with the provided match id', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    await getMatchEvents({ match_id: 9 });

    expect(mockApiGet).toHaveBeenCalledOnce();
    expect(mockApiGet).toHaveBeenCalledWith('/matches/9/events');
  });

  it('returns match events when the API response is valid', async () => {
    mockApiGet.mockResolvedValueOnce([validMatchEvent]);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual([validMatchEvent]);
  });

  it('accepts an empty match events response', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual([]);
  });

  it('accepts nullable optional fields', async () => {
    const eventWithNulls = {
      ...validMatchEvent,
      team: {
        ...validMatchEvent.team,
        logo_url: null,
      },
      extra_minute: null,
      detail: null,
      comments: null,
      player_name: null,
      secondary_player_name: null,
      player_external_id: null,
      secondary_player_external_id: null,
    };

    mockApiGet.mockResolvedValueOnce([eventWithNulls]);

    const result = await getMatchEvents({ match_id: 1 });

    expect(result).toEqual([eventWithNulls]);
  });

  it('rejects a non-array response', async () => {
    mockApiGet.mockResolvedValueOnce({
      message: 'not an array',
    });

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects a response containing null instead of an event', async () => {
    mockApiGet.mockResolvedValueOnce([null]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when team is missing', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      team: undefined,
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when team id is not a number', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      team: {
        ...validMatchEvent.team,
        id: '1',
      },
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when team name is not a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      team: {
        ...validMatchEvent.team,
        name: null,
      },
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when team short_name is not a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      team: {
        ...validMatchEvent.team,
        short_name: undefined,
      },
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when team logo_url is not nullable or a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      team: {
        ...validMatchEvent.team,
        logo_url: 10,
      },
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when event_type is not a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      event_type: null,
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when minute is not a number', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      minute: '24',
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when extra_minute is not nullable or a number', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      extra_minute: '2',
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when detail is not nullable or a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      detail: 1,
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when comments is not nullable or a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      comments: 1,
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when player_name is not nullable or a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      player_name: 123,
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when secondary_player_name is not nullable or a string', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      secondary_player_name: 123,
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when player_external_id is not nullable or a number', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      player_external_id: '123',
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('rejects an event when secondary_player_external_id is not nullable or a number', async () => {
    const invalidEvent = {
      ...validMatchEvent,
      secondary_player_external_id: '456',
    };

    mockApiGet.mockResolvedValueOnce([invalidEvent]);

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Invalid match events response');
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(getMatchEvents({ match_id: 1 })).rejects.toThrow('Network error');
  });
});
