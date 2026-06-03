import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Standing } from '@/types/standing';

import { getStandings } from './standingsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

import { apiGet } from './client';

const mockApiGet = vi.mocked(apiGet);

const standings: Record<string, Standing[]> = {
  A: [
    {
      team: {
        id: 10,
        name: 'testing',
        short_name: 'test',
        logo_url: 'example.com',
      },
      position: 1,
      matches_played: 4,
      points: 3,
      wins: 1,
      draws: 0,
      losses: 0,
      goals_for: 2,
      goals_against: 0,
      goal_difference: 2,
    },
  ],
};

describe('getStandings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws when response is null', async () => {
    mockApiGet.mockResolvedValue(null);

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('throws when response is not an object', async () => {
    mockApiGet.mockResolvedValue('invalid');

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('throws when a group value is not an array', async () => {
    mockApiGet.mockResolvedValue({ A: {} });

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('throws when response is a function', async () => {
    mockApiGet.mockResolvedValue(() => {});

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('returns valid empty response', async () => {
    mockApiGet.mockResolvedValue({});

    await expect(getStandings({ tournamentId: 1 })).resolves.toEqual({});
  });

  it('fetches standings by tournament ID', async () => {
    mockApiGet.mockResolvedValue(standings);

    const result = await getStandings({ tournamentId: 1 });

    expect(mockApiGet).toHaveBeenCalledWith('/tournaments/1/standings');
    expect(result).toEqual(standings);
  });

  it('adds group query parameter when group is provided', async () => {
    mockApiGet.mockResolvedValue(standings);

    const result = await getStandings({ tournamentId: 1, group: 'A' });

    expect(mockApiGet).toHaveBeenCalledWith('/tournaments/1/standings?group=A');
    expect(result).toEqual(standings);
  });

  it('does not add group query parameter when group is empty', async () => {
    mockApiGet.mockResolvedValue(standings);

    await getStandings({ tournamentId: 1, group: '' });

    expect(mockApiGet).toHaveBeenCalledWith('/tournaments/1/standings');
  });

  it('throws when response is null', async () => {
    mockApiGet.mockResolvedValue(null);

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('throws when response is not an object', async () => {
    mockApiGet.mockResolvedValue('invalid');

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('throws when a group value is not an array', async () => {
    mockApiGet.mockResolvedValue({
      A: {},
    });

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('allows empty standings groups', async () => {
    mockApiGet.mockResolvedValue({
      A: [],
      B: [],
    });

    await expect(getStandings({ tournamentId: 1 })).resolves.toEqual({
      A: [],
      B: [],
    });
  });
});
