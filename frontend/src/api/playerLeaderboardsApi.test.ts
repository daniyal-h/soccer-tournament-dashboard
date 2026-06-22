import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { PlayerLeaderboardApiResponse, RankedPlayer } from '@/types/playerLeaderboard';

import { LEADERBOARD_CATEGORIES } from '@/constants/playerLeaderboards';

import { apiGet } from './client';
import {
  getPlayerLeaderboard,
  isPlayerLeaderboardResponse,
  isRankedPlayer,
} from './playerLeaderboardsApi';

vi.mock('./client', () => ({
  apiGet: vi.fn(),
}));

const mockedApiGet = vi.mocked(apiGet);

function createPlayer(overrides = {}) {
  return {
    id: 1539,
    display_name: 'Kylian Mbappé',
    photo_url: 'https://example.com/mbappe.png',
    ...overrides,
  };
}

function createTeam(overrides = {}) {
  return {
    id: 2,
    name: 'France',
    short_name: 'FRA',
    logo_url: 'https://example.com/france.png',
    ...overrides,
  };
}

function createRankedPlayer(overrides: Partial<RankedPlayer> = {}): RankedPlayer {
  return {
    rank: 1,
    value: 8,
    player: createPlayer(),
    team: createTeam(),
    appearances: 7,
    minutes_played: 597,
    rating: 7.61,
    ...overrides,
  };
}

function createResponse(
  overrides: Partial<PlayerLeaderboardApiResponse> = {},
): PlayerLeaderboardApiResponse {
  return {
    category: 'goals',
    data: [createRankedPlayer()],
    ...overrides,
  };
}

describe('isRankedPlayer', () => {
  it('returns true for a valid ranked player', () => {
    expect(isRankedPlayer(createRankedPlayer())).toBe(true);
  });

  it('accepts nullable optional leaderboard fields', () => {
    expect(
      isRankedPlayer(
        createRankedPlayer({
          appearances: null,
          minutes_played: null,
          rating: null,
        }),
      ),
    ).toBe(true);
  });

  it.each([null, undefined, 'player', 1, true])(
    'returns false for non-object value %#',
    (value) => {
      expect(isRankedPlayer(value)).toBe(false);
    },
  );

  it.each([
    ['rank', '1'],
    ['value', '8'],
    ['player', null],
    ['team', null],
    ['appearances', '7'],
    ['minutes_played', '597'],
    ['rating', '7.61'],
  ])('returns false when %s has an invalid type', (field, invalidValue) => {
    expect(
      isRankedPlayer({
        ...createRankedPlayer(),
        [field]: invalidValue,
      }),
    ).toBe(false);
  });

  it('does not let null appearances make invalid minutes_played pass', () => {
    expect(
      isRankedPlayer({
        ...createRankedPlayer(),
        appearances: null,
        minutes_played: '597',
      }),
    ).toBe(false);
  });

  it('does not let null appearances make invalid rating pass', () => {
    expect(
      isRankedPlayer({
        ...createRankedPlayer(),
        appearances: null,
        rating: '7.61',
      }),
    ).toBe(false);
  });

  it('returns false when nested player summary is invalid', () => {
    expect(
      isRankedPlayer(
        createRankedPlayer({
          player: createPlayer({ display_name: null }),
        }),
      ),
    ).toBe(false);
  });

  it('returns false when nested team summary is invalid', () => {
    expect(
      isRankedPlayer(
        createRankedPlayer({
          team: createTeam({ short_name: null }),
        }),
      ),
    ).toBe(false);
  });
});

describe('isPlayerLeaderboardResponse', () => {
  it.each(LEADERBOARD_CATEGORIES)('returns true for valid category %s', (category) => {
    expect(isPlayerLeaderboardResponse(createResponse({ category }))).toBe(true);
  });

  it('returns true for an empty leaderboard response', () => {
    expect(isPlayerLeaderboardResponse(createResponse({ data: [] }))).toBe(true);
  });

  it.each([null, undefined, 'response', 1, true])(
    'returns false for non-object value %#',
    (value) => {
      expect(isPlayerLeaderboardResponse(value)).toBe(false);
    },
  );

  it('returns false for an unknown category', () => {
    expect(isPlayerLeaderboardResponse(createResponse({ category: 'banana' as never }))).toBe(
      false,
    );
  });

  it('returns false when data is not an array', () => {
    expect(
      isPlayerLeaderboardResponse({
        ...createResponse(),
        data: createRankedPlayer(),
      }),
    ).toBe(false);
  });

  it('returns false when any leaderboard row is invalid', () => {
    expect(
      isPlayerLeaderboardResponse(
        createResponse({
          data: [
            createRankedPlayer(),
            {
              ...createRankedPlayer(),
              value: null as never,
            },
          ],
        }),
      ),
    ).toBe(false);
  });
});

describe('getPlayerLeaderboard', () => {
  beforeEach(() => {
    mockedApiGet.mockReset();
  });

  it('fetches player leaderboard with encoded category and returns normalized data', async () => {
    mockedApiGet.mockResolvedValueOnce(createResponse());

    await expect(
      getPlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    ).resolves.toEqual({
      category: 'goals',
      leaderboard: [createRankedPlayer()],
    });

    expect(mockedApiGet).toHaveBeenCalledOnce();
    expect(mockedApiGet).toHaveBeenCalledWith('/tournaments/1/player-leaderboards?category=goals');
  });

  it('uses tournament id and category from options when building the request path', async () => {
    mockedApiGet.mockResolvedValueOnce(
      createResponse({
        category: 'yellow_cards',
        data: [createRankedPlayer({ value: 3 })],
      }),
    );

    const result = await getPlayerLeaderboard({
      tournament_id: 2022,
      category: 'yellow_cards',
    });

    expect(mockedApiGet).toHaveBeenCalledWith(
      '/tournaments/2022/player-leaderboards?category=yellow_cards',
    );
    expect(result.category).toBe('yellow_cards');
    expect(result.leaderboard[0].value).toBe(3);
  });

  it('throws when the API response has an invalid shape', async () => {
    mockedApiGet.mockResolvedValueOnce(
      createResponse({
        data: [
          {
            ...createRankedPlayer(),
            rating: '7.61' as never,
          },
        ],
      }),
    );

    await expect(
      getPlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    ).rejects.toThrow('Invalid player leaderboard response');
  });

  it('propagates apiGet errors', async () => {
    mockedApiGet.mockRejectedValueOnce(new Error('Network exploded'));

    await expect(
      getPlayerLeaderboard({
        tournament_id: 1,
        category: 'assists',
      }),
    ).rejects.toThrow('Network exploded');
  });
});
