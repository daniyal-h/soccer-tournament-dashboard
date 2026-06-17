import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiGet } from './client';
import { getTeamMatches, getTeamProfile, isTeamSummary } from './teamsApi';

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

const validMatch = {
  id: 100,
  team_a: validTeamSummary,
  team_b: {
    id: 2,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: 'https://example.com/brazil.png',
  },
  kickoff_time: '2026-06-12T20:00:00Z',
  stage: 'group',
  group: 'B',
  status: 'scheduled',
  venue: 'BC Place',
  city: 'Vancouver',
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

const validTeamMatchesApiResponse = {
  data: [validMatch],
};

const validTeamMatches = {
  matches: [validMatch],
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

describe('getTeamMatches', () => {
  beforeEach(() => {
    mockedApiGet.mockReset();
  });

  it('fetches team matches using the tournament and team ids', async () => {
    mockedApiGet.mockResolvedValueOnce(validTeamMatchesApiResponse);

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).resolves.toEqual(validTeamMatches);

    expect(mockedApiGet).toHaveBeenCalledTimes(1);
    expect(mockedApiGet).toHaveBeenCalledWith('/tournaments/12/teams/34/matches');
  });

  it('unwraps the api data envelope into matches', async () => {
    const secondMatch = {
      ...validMatch,
      id: 101,
      team_a_score: 2,
      team_b_score: 1,
      status: 'finished',
    };

    mockedApiGet.mockResolvedValueOnce({
      data: [validMatch, secondMatch],
    });

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).resolves.toEqual({
      matches: [validMatch, secondMatch],
    });
  });

  it('allows an empty matches list', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: [],
    });

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).resolves.toEqual({
      matches: [],
    });
  });

  it.each([null, undefined, 'matches', 1, true, []])(
    'rejects non-team-matches response %#',
    async (response) => {
      mockedApiGet.mockResolvedValueOnce(response);

      await expect(
        getTeamMatches({
          tournament_id: 12,
          team_id: 34,
        }),
      ).rejects.toThrow('Invalid team matches response');
    },
  );

  it('rejects response with missing data property', async () => {
    mockedApiGet.mockResolvedValueOnce({});

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team matches response');
  });

  it.each([null, undefined, {}, 'not-array', 123, true])(
    'rejects response with invalid data %#',
    async (data) => {
      mockedApiGet.mockResolvedValueOnce({
        data,
      });

      await expect(
        getTeamMatches({
          tournament_id: 12,
          team_id: 34,
        }),
      ).rejects.toThrow('Invalid team matches response');
    },
  );

  it('rejects response when one match is invalid', async () => {
    mockedApiGet.mockResolvedValueOnce({
      data: [
        validMatch,
        {
          ...validMatch,
          id: '101',
        },
      ],
    });

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team matches response');
  });

  it.each([
    ['id', '100'],
    ['team_a', null],
    ['team_b', undefined],
    ['kickoff_time', null],
    ['stage', null],
    ['status', 123],
    ['group', 123],
    ['venue', 123],
    ['city', 123],
    ['elapsed', '90'],
    ['team_a_score', '1'],
    ['team_b_score', '0'],
    ['team_a_penalties', '5'],
    ['team_b_penalties', '4'],
  ])('rejects match with invalid %s', async (key, value) => {
    mockedApiGet.mockResolvedValueOnce({
      data: [
        {
          ...validMatch,
          [key]: value,
        },
      ],
    });

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team matches response');
  });

  it.each([
    'id',
    'team_a',
    'team_b',
    'kickoff_time',
    'stage',
    'status',
    'group',
    'venue',
    'city',
    'elapsed',
    'team_a_score',
    'team_b_score',
    'team_a_penalties',
    'team_b_penalties',
  ] as const)('rejects match with missing %s', async (key) => {
    mockedApiGet.mockResolvedValueOnce({
      data: [omitKey(validMatch, key)],
    });

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Invalid team matches response');
  });

  it('does not swallow api errors', async () => {
    mockedApiGet.mockRejectedValueOnce(new Error('Network failed'));

    await expect(
      getTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    ).rejects.toThrow('Network failed');
  });
});
