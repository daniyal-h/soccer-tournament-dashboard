import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from './client';
import { getTeamProfile, isTeamSummary } from './teamsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

const mockedApiGet = vi.mocked(apiGet);

function omitKey<T extends Record<string, unknown>, K extends keyof T>(
  object: T,
  key: K,
): Omit<T, K> {
  const copy = { ...object };
  delete copy[key];
  return copy;
}

const validTeamSummary = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: 'https://example.com/canada.png',
};

const validStandingStats = {
  position: 2,
  matches_played: 3,
  wins: 2,
  draws: 0,
  losses: 1,
  goals_for: 5,
  goals_against: 2,
  goal_difference: 3,
  points: 6,
};

const validTeamProfile = {
  team: validTeamSummary,
  group: 'B',
  standing: validStandingStats,
};

describe('isTeam', () => {
  const validTeam = {
    id: 1,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  };

  it('returns true for a valid team', () => {
    expect(isTeamSummary(validTeam)).toBe(true);
  });

  it('allows null logo url', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        logo_url: null,
      }),
    ).toBe(true);
  });

  it('rejects null', () => {
    expect(isTeamSummary(null)).toBe(false);
  });

  it('rejects non-object values', () => {
    expect(isTeamSummary('team')).toBe(false);
    expect(isTeamSummary(1)).toBe(false);
    expect(isTeamSummary(true)).toBe(false);
    expect(isTeamSummary(undefined)).toBe(false);
  });

  it('rejects invalid id', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        id: '1',
      }),
    ).toBe(false);
  });

  it('rejects missing id', () => {
    expect(isTeamSummary(omitKey(validTeam, 'id'))).toBe(false);
  });

  it('rejects invalid name', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        name: null,
      }),
    ).toBe(false);
  });

  it('rejects missing name', () => {
    expect(isTeamSummary(omitKey(validTeam, 'name'))).toBe(false);
  });

  it('rejects invalid short name', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        short_name: 123,
      }),
    ).toBe(false);
  });

  it('rejects missing short name', () => {
    expect(isTeamSummary(omitKey(validTeam, 'short_name'))).toBe(false);
  });

  it('rejects invalid logo url', () => {
    expect(
      isTeamSummary({
        ...validTeam,
        logo_url: 123,
      }),
    ).toBe(false);
  });

  it('rejects missing logo url', () => {
    expect(isTeamSummary(omitKey(validTeam, 'logo_url'))).toBe(false);
  });
});

describe('isTeamSummary', () => {
  it('returns true for a valid team summary', () => {
    expect(isTeamSummary(validTeamSummary)).toBe(true);
  });

  it('allows null logo url', () => {
    expect(
      isTeamSummary({
        ...validTeamSummary,
        logo_url: null,
      }),
    ).toBe(true);
  });

  it.each([null, undefined, 'team', 1, true, []])('rejects non-team value %#', (value) => {
    expect(isTeamSummary(value)).toBe(false);
  });

  it.each([
    ['id', '1'],
    ['id', null],
    ['name', null],
    ['name', 123],
    ['short_name', null],
    ['short_name', 123],
    ['logo_url', 123],
    ['logo_url', undefined],
  ])('rejects invalid %s', (key, value) => {
    expect(
      isTeamSummary({
        ...validTeamSummary,
        [key]: value,
      }),
    ).toBe(false);
  });

  it.each(['id', 'name', 'short_name', 'logo_url'] as const)('rejects missing %s', (key) => {
    expect(isTeamSummary(omitKey(validTeamSummary, key))).toBe(false);
  });
});

describe('getTeamProfile', () => {
  beforeEach(() => {
    mockedApiGet.mockReset();
  });

  it('fetches the team profile using the tournament and team ids', async () => {
    mockedApiGet.mockResolvedValueOnce(validTeamProfile);

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).resolves.toEqual(validTeamProfile);

    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/tournaments/12/teams/34/profile');
  });

  it('allows a null standing when group stage summary is unavailable', async () => {
    const profileWithoutStanding = {
      ...validTeamProfile,
      standing: null,
    };

    mockedApiGet.mockResolvedValueOnce(profileWithoutStanding);

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).resolves.toEqual(profileWithoutStanding);
  });

  it.each([null, undefined, 'profile', 1, true, []])(
    'rejects non-profile response %#',
    async (response) => {
      mockedApiGet.mockResolvedValueOnce(response);

      await expect(
        getTeamProfile({
          tournament_id: 12,
          team_id: 34,
        }),
      ).rejects.toThrow('Invalid team profile response');
    },
  );

  it('rejects profile response with invalid team summary', async () => {
    mockedApiGet.mockResolvedValueOnce({
      ...validTeamProfile,
      team: {
        ...validTeamSummary,
        id: '1',
      },
    });

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team profile response');
  });

  it('rejects profile response with missing team summary', async () => {
    mockedApiGet.mockResolvedValueOnce(omitKey(validTeamProfile, 'team'));

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team profile response');
  });

  it.each([null, undefined, 2, {}])('rejects invalid group %#', async (group) => {
    mockedApiGet.mockResolvedValueOnce({
      ...validTeamProfile,
      group,
    });

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team profile response');
  });

  it('rejects profile response with missing group', async () => {
    mockedApiGet.mockResolvedValueOnce(omitKey(validTeamProfile, 'group'));

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team profile response');
  });

  it.each([
    ['position', '2'],
    ['matches_played', '3'],
    ['wins', null],
    ['draws', undefined],
    ['losses', '1'],
    ['goals_for', null],
    ['goals_against', '2'],
    ['goal_difference', null],
    ['points', '6'],
  ])('rejects invalid standing %s', async (key, value) => {
    mockedApiGet.mockResolvedValueOnce({
      ...validTeamProfile,
      standing: {
        ...validStandingStats,
        [key]: value,
      },
    });

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team profile response');
  });

  it('rejects profile response with missing standing', async () => {
    mockedApiGet.mockResolvedValueOnce(omitKey(validTeamProfile, 'standing'));

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team profile response');
  });

  it('does not swallow api errors', async () => {
    mockedApiGet.mockRejectedValueOnce(new Error('Network failed'));

    await expect(
      getTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Network failed');
  });
});
