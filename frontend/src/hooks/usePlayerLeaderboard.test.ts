import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getPlayerLeaderboard } from '@/api/playerLeaderboardsApi';

import type { PlayerLeaderboard } from '@/types/playerLeaderboard';

import { EMPTY_MESSAGES } from '@/constants/playerLeaderboards';
import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { usePlayerLeaderboard } from './usePlayerLeaderboard';

vi.mock('@/api/playerLeaderboardsApi', () => ({
  getPlayerLeaderboard: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

const mockedUseApiQuery = vi.mocked(useApiQuery);
const mockedGetPlayerLeaderboard = vi.mocked(getPlayerLeaderboard);

function makeLeaderboardResponse(overrides: Partial<PlayerLeaderboard> = {}): PlayerLeaderboard {
  return {
    category: 'goals',
    leaderboard: [
      {
        rank: 1,
        value: 8,
        player: {
          id: 1539,
          display_name: 'Kylian Mbappé',
          photo_url: 'https://example.com/mbappe.png',
        },
        team: {
          id: 2,
          name: 'France',
          short_name: 'FRA',
          logo_url: 'https://example.com/france.png',
        },
        appearances: 7,
        minutes_played: 597,
        rating: 7.61,
      },
    ],
    ...overrides,
  };
}

function mockApiQueryReturn(overrides: Partial<ReturnType<typeof useApiQuery>> = {}) {
  const retry = vi.fn();

  const apiQueryResult = {
    data: makeLeaderboardResponse(),
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry,
    canRetry: true,
    ...overrides,
  } as unknown as ReturnType<typeof useApiQuery>;

  mockedUseApiQuery.mockReturnValue(apiQueryResult);

  return { retry };
}

describe('usePlayerLeaderboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes the correct query config to useApiQuery', () => {
    mockApiQueryReturn();

    renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    );

    expect(mockedUseApiQuery).toHaveBeenCalledOnce();

    const config = mockedUseApiQuery.mock.calls[0][0];

    expect(config.queryKey).toEqual(queryKeys.playerLeaderboard.all(1, 'goals'));
    expect(config.staleTime).toBe(QUERY_STALE_TIMES.playerLeaderboard);
    expect(config.errorMessages).toEqual({
      notFound: 'Leaderboard was not found.',
      generic: 'Failed to load leaderboard.',
    });
  });

  it('queryFn fetches the selected tournament and category', async () => {
    mockApiQueryReturn();

    mockedGetPlayerLeaderboard.mockResolvedValueOnce(makeLeaderboardResponse());

    renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 9,
        category: 'yellow_cards',
      }),
    );

    const config = mockedUseApiQuery.mock.calls[0][0];

    await expect(config.queryFn()).resolves.toEqual(makeLeaderboardResponse());

    expect(mockedGetPlayerLeaderboard).toHaveBeenCalledOnce();
    expect(mockedGetPlayerLeaderboard).toHaveBeenCalledWith({
      tournament_id: 9,
      category: 'yellow_cards',
    });
  });

  it('returns leaderboard data and query state', () => {
    const retry = vi.fn();
    const data = makeLeaderboardResponse({
      category: 'assists',
    });

    mockedUseApiQuery.mockReturnValue({
      data,
      isInitialLoading: false,
      isRefreshing: true,
      displayError: null,
      retry,
      canRetry: true,
    } as unknown as ReturnType<typeof useApiQuery>);

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'assists',
      }),
    );

    expect(result.current.playerLeaderboard).toBe(data);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBeNull();
    expect(result.current.refetch).toBe(retry);
    expect(result.current.canRetry).toBe(true);
  });

  it('returns null leaderboard when query has no data', () => {
    mockApiQueryReturn({
      data: undefined,
    });

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    );

    expect(result.current.playerLeaderboard).toBeNull();
  });

  it('returns category-specific empty state when loaded without rows', () => {
    mockApiQueryReturn({
      data: makeLeaderboardResponse({
        category: 'goals',
        leaderboard: [],
      }),
      isInitialLoading: false,
      displayError: null,
    });

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    );

    expect(result.current.emptyState).toBe(EMPTY_MESSAGES.goals);
  });

  it('does not return empty state while initially loading', () => {
    mockApiQueryReturn({
      data: makeLeaderboardResponse({
        leaderboard: [],
      }),
      isInitialLoading: true,
      displayError: null,
    });

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });

  it('does not return empty state when an error exists', () => {
    const error = new Error('Failed to load leaderboard.');

    mockApiQueryReturn({
      data: makeLeaderboardResponse({
        leaderboard: [],
      }),
      isInitialLoading: false,
      displayError: error,
    });

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    );

    expect(result.current.error).toBe(error);
    expect(result.current.emptyState).toBeNull();
  });

  it('does not return empty state when leaderboard has rows', () => {
    mockApiQueryReturn({
      data: makeLeaderboardResponse(),
      isInitialLoading: false,
      displayError: null,
    });

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'goals',
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });

  it('uses the selected category when choosing empty message', () => {
    mockApiQueryReturn({
      data: makeLeaderboardResponse({
        category: 'yellow_cards',
        leaderboard: [],
      }),
      isInitialLoading: false,
      displayError: null,
    });

    const { result } = renderHook(() =>
      usePlayerLeaderboard({
        tournament_id: 1,
        category: 'yellow_cards',
      }),
    );

    expect(result.current.emptyState).toBe(EMPTY_MESSAGES.yellow_cards);
  });
});
