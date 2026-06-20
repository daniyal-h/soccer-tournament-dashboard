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

  it.each([
    ['null standing row', { A: [null] }],
    ['string standing row', { A: ['invalid'] }],
    ['number standing row', { A: [123] }],
    ['array standing row', { A: [[]] }],
    ['missing team', { A: [{ ...standings.A[0], team: undefined }] }],
    ['invalid team', { A: [{ ...standings.A[0], team: { id: '10' } }] }],
    ['missing position', { A: [{ ...standings.A[0], position: undefined }] }],
    ['invalid position', { A: [{ ...standings.A[0], position: '1' }] }],
    ['missing matches_played', { A: [{ ...standings.A[0], matches_played: undefined }] }],
    ['missing points', { A: [{ ...standings.A[0], points: undefined }] }],
    ['missing wins', { A: [{ ...standings.A[0], wins: undefined }] }],
    ['missing draws', { A: [{ ...standings.A[0], draws: undefined }] }],
    ['missing losses', { A: [{ ...standings.A[0], losses: undefined }] }],
    ['missing goals_for', { A: [{ ...standings.A[0], goals_for: undefined }] }],
    ['missing goals_against', { A: [{ ...standings.A[0], goals_against: undefined }] }],
    ['missing goal_difference', { A: [{ ...standings.A[0], goal_difference: undefined }] }],
  ])('throws when response has %s', async (_caseName, response) => {
    mockApiGet.mockResolvedValue(response);

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });

  it('throws when response is an array', async () => {
    mockApiGet.mockResolvedValue([]);

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });
  
  it('throws when one row in an otherwise valid group is invalid', async () => {
    mockApiGet.mockResolvedValue({
      A: [
        standings.A[0],
        {
          ...standings.A[0],
          team: null,
        },
      ],
    });

    await expect(getStandings({ tournamentId: 1 })).rejects.toThrow('Invalid standings response');
  });
});
