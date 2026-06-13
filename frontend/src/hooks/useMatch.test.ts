import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useApiQuery } from '@/hooks/useApiQuery';
import { useMatch } from '@/hooks/useMatch';

import { getMatch } from '@/api/matchesApi';

import type { Match } from '@/types/match';

import { AUTO_REFETCH_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

vi.mock('@/api/matchesApi');
vi.mock('@/hooks/useApiQuery');

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockGetMatch = vi.mocked(getMatch);

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  team_a: {
    id: 10,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  team_b: {
    id: 20,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: 'https://example.com/brazil.png',
  },
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

const retry = vi.fn();

function mockApiQueryResult(overrides = {}) {
  mockUseApiQuery.mockReturnValue({
    data: undefined,
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry,
    canRetry: false,
    ...overrides,
  } as unknown as ReturnType<typeof useApiQuery>);
}

describe('useMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiQueryResult();
  });

  it('configures useApiQuery with the match query key, fetcher, stale time, and errors', () => {
    renderHook(() => useMatch(7));

    expect(mockUseApiQuery).toHaveBeenCalledTimes(1);
    expect(mockUseApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.matches.detail(7),
        staleTime: QUERY_STALE_TIMES.match,
        errorMessages: {
          notFound: 'Match was not found.',
          generic: 'Failed to load match.',
        },
      }),
    );
  });

  it('fetches the match using the provided match id', async () => {
    renderHook(() => useMatch(42));

    const queryOptions = mockUseApiQuery.mock.calls[0][0];

    mockGetMatch.mockResolvedValueOnce(baseMatch);

    await queryOptions.queryFn();

    expect(mockGetMatch).toHaveBeenCalledTimes(1);
    expect(mockGetMatch).toHaveBeenCalledWith({ match_id: 42 });
  });

  it('returns null match when query data is missing', () => {
    mockApiQueryResult({ data: undefined });

    const { result } = renderHook(() => useMatch(1));

    expect(result.current.match).toBeNull();
  });

  it('returns match data when query data exists', () => {
    mockApiQueryResult({ data: baseMatch });

    const { result } = renderHook(() => useMatch(1));

    expect(result.current.match).toEqual(baseMatch);
  });

  it('maps loading, refreshing, error, retry, and canRetry from useApiQuery', () => {
    const error = new Error('Failed to load match.');

    mockApiQueryResult({
      data: baseMatch,
      isInitialLoading: true,
      isRefreshing: true,
      displayError: error,
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() => useMatch(1));

    expect(result.current).toEqual({
      match: baseMatch,
      isLoading: true,
      isRefreshing: true,
      error,
      refetch: retry,
      canRetry: true,
    });
  });

  it('does not auto-refetch when match data is missing', () => {
    renderHook(() => useMatch(1));

    const queryOptions = mockUseApiQuery.mock.calls[0][0];

    const refetchInterval = queryOptions.refetchInterval;
    if (typeof refetchInterval === 'function') {
      const interval = refetchInterval({
        state: {
          data: undefined,
        },
      } as Parameters<typeof refetchInterval>[0]);

      expect(interval).toBe(false);
    }
  });

  it('does not auto-refetch when match is not live', () => {
    renderHook(() => useMatch(1));

    const queryOptions = mockUseApiQuery.mock.calls[0][0];

    const refetchInterval = queryOptions.refetchInterval;
    if (typeof refetchInterval === 'function') {
      const interval = refetchInterval({
        state: {
          data: {
            ...baseMatch,
            status: 'scheduled',
          },
        },
      } as Parameters<typeof refetchInterval>[0]);

      expect(interval).toBe(false);
    }
  });

  it('auto-refetches when match is live', () => {
    renderHook(() => useMatch(1));

    const queryOptions = mockUseApiQuery.mock.calls[0][0];

    const refetchInterval = queryOptions.refetchInterval;
    if (typeof refetchInterval === 'function') {
      const interval = refetchInterval({
        state: {
          data: {
            ...baseMatch,
            status: 'live',
          },
        },
      } as Parameters<typeof refetchInterval>[0]);

      expect(interval).toBe(AUTO_REFETCH_TIMES.matches);
    }
  });

  it('does not auto-refetch when match is not live', () => {
    renderHook(() => useMatch(1));

    const queryOptions = mockUseApiQuery.mock.calls[0][0];
    const refetchInterval = queryOptions.refetchInterval;

    expect(typeof refetchInterval).toBe('function');

    if (typeof refetchInterval !== 'function') {
      throw new Error('Expected refetchInterval to be a function.');
    }

    const interval = refetchInterval({
      state: {
        data: {
          ...baseMatch,
          status: 'scheduled',
        },
      },
    } as Parameters<typeof refetchInterval>[0]);

    expect(interval).toBe(false);
  });

  it('auto-refetches when match is live', () => {
    renderHook(() => useMatch(1));

    const queryOptions = mockUseApiQuery.mock.calls[0][0];
    const refetchInterval = queryOptions.refetchInterval;

    expect(typeof refetchInterval).toBe('function');

    if (typeof refetchInterval !== 'function') {
      throw new Error('Expected refetchInterval to be a function.');
    }

    const interval = refetchInterval({
      state: {
        data: {
          ...baseMatch,
          status: 'live',
        },
      },
    } as Parameters<typeof refetchInterval>[0]);

    expect(interval).toBe(AUTO_REFETCH_TIMES.matches);
  });
});
