import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMatch, getMatches } from '@/api/matchesApi';

import type { Match } from '@/types/match';

import { apiGet } from './client';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

const mockApiGet = vi.mocked(apiGet);

const validMatch: Match = {
  id: 1,
  team_a: {
    id: 1,
    name: 'Belgium',
    short_name: 'BEL',
    logo_url: 'https://media.api-sports.io/football/teams/1.png',
  },
  team_b: {
    id: 2,
    name: 'France',
    short_name: 'FRA',
    logo_url: 'https://media.api-sports.io/football/teams/2.png',
  },
  kickoff_time: '2026-06-11T18:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'live',
  venue: 'BMO Field',
  city: 'Toronto',
  elapsed: 88,
  team_a_score: 2,
  team_b_score: 1,
};

describe('getMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the match endpoint with the provided match id', async () => {
    mockApiGet.mockResolvedValueOnce(validMatch);

    await getMatch({ match_id: 7 });

    expect(mockApiGet).toHaveBeenCalledOnce();
    expect(mockApiGet).toHaveBeenCalledWith('/matches/7');
  });

  it('returns the match when the API response is valid', async () => {
    mockApiGet.mockResolvedValueOnce(validMatch);

    const result = await getMatch({ match_id: 1 });

    expect(result).toEqual(validMatch);
  });

  it('rejects a null response', async () => {
    mockApiGet.mockResolvedValueOnce(null);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects an array response', async () => {
    mockApiGet.mockResolvedValueOnce([validMatch]);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when match id is missing', async () => {
    const invalidMatch = {
      ...validMatch,
      id: undefined,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when match id is not a number', async () => {
    const invalidMatch = {
      ...validMatch,
      id: '1',
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when kickoff_time is not a string', async () => {
    const invalidMatch = {
      ...validMatch,
      kickoff_time: null,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when stage is not a string', async () => {
    const invalidMatch = {
      ...validMatch,
      stage: 1,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when status is not a string', async () => {
    const invalidMatch = {
      ...validMatch,
      status: undefined,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when team_a is null', async () => {
    const invalidMatch = {
      ...validMatch,
      team_a: null,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a response when team_b is null', async () => {
    const invalidMatch = {
      ...validMatch,
      team_b: null,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Network error');
  });
});

describe('getMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the tournament matches endpoint with the provided tournament id', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    await getMatches({ tournament_id: 1 });

    expect(mockApiGet).toHaveBeenCalledOnce();
    expect(mockApiGet).toHaveBeenCalledWith('/tournaments/1/matches');
  });

  it('returns matches when the API response is valid', async () => {
    mockApiGet.mockResolvedValueOnce([validMatch]);

    const result = await getMatches({ tournament_id: 1 });

    expect(result).toEqual([validMatch]);
  });

  it('accepts an empty matches response', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    const result = await getMatches({ tournament_id: 1 });

    expect(result).toEqual([]);
  });

  it('rejects a non-array response', async () => {
    mockApiGet.mockResolvedValueOnce({
      message: 'not an array',
    });

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when a match is missing an id', async () => {
    const invalidMatch = {
      ...validMatch,
      id: undefined,
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when match id is not a number', async () => {
    const invalidMatch = {
      ...validMatch,
      id: '1',
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when kickoff_time is not a string', async () => {
    const invalidMatch = {
      ...validMatch,
      kickoff_time: 20260611,
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when stage is not a string', async () => {
    const invalidMatch = {
      ...validMatch,
      stage: null,
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when status is not a string', async () => {
    const invalidMatch = {
      ...validMatch,
      status: null,
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when team_a is not an object', async () => {
    const invalidMatch = {
      ...validMatch,
      team_a: null,
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when team_b is not an object', async () => {
    const invalidMatch = {
      ...validMatch,
      team_b: null,
    };

    mockApiGet.mockResolvedValueOnce([invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Network error');
  });
});
