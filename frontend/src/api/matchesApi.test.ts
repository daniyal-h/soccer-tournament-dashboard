import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMatch, getMatches } from '@/api/matchesApi';

import type { Match } from '@/types/match';
import type { Team } from '@/types/team';

import { apiGet } from './client';
import { isTeam } from './teamsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

vi.mock('./teamsApi', () => ({
  isTeam: vi.fn(),
}));

const mockApiGet = vi.mocked(apiGet);
const mockIsTeam = vi.mocked(isTeam);

const validTeamA: Team = {
  id: 1,
  name: 'Belgium',
  short_name: 'BEL',
  logo_url: 'https://media.api-sports.io/football/teams/1.png',
};

const validTeamB: Team = {
  id: 2,
  name: 'France',
  short_name: 'FRA',
  logo_url: 'https://media.api-sports.io/football/teams/2.png',
};

const validMatch: Match = {
  id: 1,
  team_a: validTeamA,
  team_b: validTeamB,
  kickoff_time: '2026-06-11T18:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'live',
  venue: 'BMO Field',
  city: 'Toronto',
  elapsed: 88,
  team_a_score: 2,
  team_b_score: 1,
  team_a_penalties: null,
  team_b_penalties: null,
};

function mockTeamGuard() {
  mockIsTeam.mockImplementation((value: unknown): value is Team => {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const team = value as Team;

    return (
      typeof team.id === 'number' &&
      typeof team.name === 'string' &&
      typeof team.short_name === 'string' &&
      typeof team.logo_url === 'string'
    );
  });
}

function buildMatch(overrides: Partial<Match> = {}): Match {
  return {
    ...validMatch,
    ...overrides,
  };
}

describe('getMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTeamGuard();
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
    expect(mockIsTeam).toHaveBeenCalledTimes(2);
    expect(mockIsTeam).toHaveBeenNthCalledWith(1, validTeamA);
    expect(mockIsTeam).toHaveBeenNthCalledWith(2, validTeamB);
  });

  it('accepts nullable match fields when they are explicitly null', async () => {
    const matchWithNulls = buildMatch({
      group: null,
      venue: null,
      city: null,
      elapsed: null,
      team_a_score: null,
      team_b_score: null,
      team_a_penalties: null,
      team_b_penalties: null,
    });

    mockApiGet.mockResolvedValueOnce(matchWithNulls);

    const result = await getMatch({ match_id: 1 });

    expect(result).toEqual(matchWithNulls);
  });

  it.each([
    ['group', undefined],
    ['venue', undefined],
    ['city', undefined],
    ['elapsed', undefined],
    ['team_a_score', undefined],
    ['team_b_score', undefined],
    ['team_a_penalties', undefined],
    ['team_b_penalties', undefined],
    ['group', 123],
    ['venue', 123],
    ['city', 123],
    ['elapsed', '88'],
    ['team_a_score', '2'],
    ['team_b_score', '1'],
    ['team_a_penalties', '5'],
    ['team_b_penalties', '4'],
  ])('rejects a response when %s is %s', async (field, value) => {
    const invalidMatch = {
      ...validMatch,
      [field]: value,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects a null response', async () => {
    mockApiGet.mockResolvedValueOnce(null);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it('rejects an array response', async () => {
    mockApiGet.mockResolvedValueOnce([validMatch]);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it.each([
    ['id', undefined],
    ['id', '1'],
    ['kickoff_time', null],
    ['kickoff_time', 20260611],
    ['stage', null],
    ['stage', 1],
    ['status', null],
    ['status', undefined],
  ])('rejects a response when %s is %s', async (field, value) => {
    const invalidMatch = {
      ...validMatch,
      [field]: value,
    };

    mockApiGet.mockResolvedValueOnce(invalidMatch);

    await expect(getMatch({ match_id: 1 })).rejects.toThrow('Invalid match response');
  });

  it.each([
    ['team_a', null],
    ['team_a', undefined],
    ['team_a', {}],
    ['team_a', { ...validTeamA, id: '1' }],
    ['team_a', { ...validTeamA, name: null }],
    ['team_a', { ...validTeamA, short_name: undefined }],
    ['team_a', { ...validTeamA, logo_url: null }],
    ['team_b', null],
    ['team_b', undefined],
    ['team_b', {}],
    ['team_b', { ...validTeamB, id: '2' }],
    ['team_b', { ...validTeamB, name: null }],
    ['team_b', { ...validTeamB, short_name: undefined }],
    ['team_b', { ...validTeamB, logo_url: null }],
  ])('rejects a response when %s fails team validation', async (field, value) => {
    const invalidMatch = {
      ...validMatch,
      [field]: value,
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
    mockTeamGuard();
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
    expect(mockIsTeam).toHaveBeenCalledTimes(2);
    expect(mockIsTeam).toHaveBeenNthCalledWith(1, validTeamA);
    expect(mockIsTeam).toHaveBeenNthCalledWith(2, validTeamB);
  });

  it('accepts an empty matches response without validating teams', async () => {
    mockApiGet.mockResolvedValueOnce([]);

    const result = await getMatches({ tournament_id: 1 });

    expect(result).toEqual([]);
    expect(mockIsTeam).not.toHaveBeenCalled();
  });

  it('rejects a non-array response', async () => {
    mockApiGet.mockResolvedValueOnce({
      message: 'not an array',
    });

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when any match has invalid required scalar fields', async () => {
    const invalidMatch = {
      ...validMatch,
      id: '1',
    };

    mockApiGet.mockResolvedValueOnce([validMatch, invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when any match has an undefined nullable field', async () => {
    const invalidMatch = {
      ...validMatch,
      elapsed: undefined,
    };

    mockApiGet.mockResolvedValueOnce([validMatch, invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when any match has an invalid nullable field type', async () => {
    const invalidMatch = {
      ...validMatch,
      team_a_score: '2',
    };

    mockApiGet.mockResolvedValueOnce([validMatch, invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when any match has an invalid team_a object', async () => {
    const invalidMatch = {
      ...validMatch,
      team_a: {
        ...validTeamA,
        logo_url: null,
      },
    };

    mockApiGet.mockResolvedValueOnce([validMatch, invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('rejects a response when any match has an invalid team_b object', async () => {
    const invalidMatch = {
      ...validMatch,
      team_b: {
        ...validTeamB,
        short_name: undefined,
      },
    };

    mockApiGet.mockResolvedValueOnce([validMatch, invalidMatch]);

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Invalid matches response');
  });

  it('propagates apiGet errors', async () => {
    mockApiGet.mockRejectedValueOnce(new Error('Network error'));

    await expect(getMatches({ tournament_id: 1 })).rejects.toThrow('Network error');
  });
});
