import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getStandings } from '@/api/standingsApi';

import type { Standing } from '@/types/standing';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useStandings } from './useStandings';

vi.mock('@/api/standingsApi', () => ({
  getStandings: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

const mockedGetStandings = vi.mocked(getStandings);
const mockedUseApiQuery = vi.mocked(useApiQuery);

const retry = vi.fn();

const standings: Record<string, Standing[]> = {
  A: [
    {
      team: {
        id: 1,
        name: 'Argentina',
        short_name: 'ARG',
        logo_url: 'https://flagcdn.com/w40/ar.png',
      },
      position: 1,
      matches_played: 3,
      wins: 3,
      draws: 0,
      losses: 0,
      goals_for: 8,
      goals_against: 2,
      goal_difference: 6,
      points: 9,
    },
  ],
};

function mockApiQueryResult(overrides = {}) {
  mockedUseApiQuery.mockReturnValue({
    data: undefined,
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry,
    canRetry: false,
    ...overrides,
  } as unknown as ReturnType<typeof useApiQuery>);
}

describe('useStandings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiQueryResult();
  });

  it('configures useApiQuery with standings key, fetcher, stale time, and error messages', () => {
    renderHook(() => useStandings({ tournamentId: 7, group: 'A' }));

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(mockedUseApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.standings.all(7, 'A'),
        staleTime: QUERY_STALE_TIMES.standings,
        errorMessages: {
          notFound: 'Groups and rankings will appear once tournament data is available.',
          generic: 'Failed to load standings.',
        },
      }),
    );
  });

  it('fetches standings using tournament and group options', async () => {
    renderHook(() => useStandings({ tournamentId: 9, group: 'B' }));

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    mockedGetStandings.mockResolvedValueOnce(standings);

    await queryOptions.queryFn();

    expect(mockedGetStandings).toHaveBeenCalledTimes(1);
    expect(mockedGetStandings).toHaveBeenCalledWith({
      tournamentId: 9,
      group: 'B',
    });
  });

  it('fetches standings with undefined group when no group is provided', async () => {
    renderHook(() => useStandings({ tournamentId: 9 }));

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    mockedGetStandings.mockResolvedValueOnce(standings);

    await queryOptions.queryFn();

    expect(mockedGetStandings).toHaveBeenCalledTimes(1);
    expect(mockedGetStandings).toHaveBeenCalledWith({
      tournamentId: 9,
      group: undefined,
    });
  });

  it('returns an empty standings object when query data is missing', () => {
    mockApiQueryResult({ data: undefined });

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    expect(result.current.standings).toEqual({});
  });

  it('returns standings data when query data exists', () => {
    mockApiQueryResult({ data: standings });

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    expect(result.current.standings).toEqual(standings);
    expect(result.current.standings.A[0].team.short_name).toBe('ARG');
  });

  it('maps loading, refreshing, error, retry, and canRetry from useApiQuery', () => {
    const error = new Error('Failed to load standings.');

    mockApiQueryResult({
      data: standings,
      isInitialLoading: true,
      isRefreshing: true,
      displayError: error,
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    expect(result.current).toEqual({
      standings,
      isLoading: true,
      isRefreshing: true,
      error,
      refetch: retry,
      canRetry: true,
    });
  });

  it('updates query key and query function when tournament id changes', async () => {
    const { rerender } = renderHook(({ tournamentId }) => useStandings({ tournamentId }), {
      initialProps: { tournamentId: 1 },
    });

    rerender({ tournamentId: 2 });

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.standings.all(1, undefined),
      }),
    );

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.standings.all(2, undefined),
      }),
    );

    const secondQueryOptions = mockedUseApiQuery.mock.calls[1][0];

    mockedGetStandings.mockResolvedValueOnce(standings);

    await secondQueryOptions.queryFn();

    expect(mockedGetStandings).toHaveBeenCalledWith({
      tournamentId: 2,
      group: undefined,
    });
  });

  it('updates query key and query function when group changes', async () => {
    const { rerender } = renderHook(({ group }) => useStandings({ tournamentId: 1, group }), {
      initialProps: { group: undefined as string | undefined },
    });

    rerender({ group: 'A' });

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.standings.all(1, undefined),
      }),
    );

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.standings.all(1, 'A'),
      }),
    );

    const secondQueryOptions = mockedUseApiQuery.mock.calls[1][0];

    mockedGetStandings.mockResolvedValueOnce(standings);

    await secondQueryOptions.queryFn();

    expect(mockedGetStandings).toHaveBeenCalledWith({
      tournamentId: 1,
      group: 'A',
    });
  });
});
