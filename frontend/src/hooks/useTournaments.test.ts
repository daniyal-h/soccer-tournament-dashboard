import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTournaments } from '@/api/tournamentsApi';

import type { Tournament } from '@/types/tournament';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useTournaments } from './useTournaments';

vi.mock('@/api/tournamentsApi', () => ({
  getTournaments: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

const mockedGetTournaments = vi.mocked(getTournaments);
const mockedUseApiQuery = vi.mocked(useApiQuery);

const retry = vi.fn();

const tournaments: Tournament[] = [
  {
    id: 1,
    name: 'FIFA World Cup',
    season: '2026',
    logo_url: null,
    start_date: '2026-06-11',
    end_date: '2026-07-19',
  },
  {
    id: 2,
    name: 'Copa América',
    season: '2024',
    logo_url: 'https://example.com/copa.png',
    start_date: '2024-06-20',
    end_date: '2024-07-14',
  },
];

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

describe('useTournaments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiQueryResult();
  });

  it('configures useApiQuery with tournaments key, fetcher, stale time, and error messages', () => {
    renderHook(() => useTournaments());

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(mockedUseApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.tournaments.all,
        staleTime: QUERY_STALE_TIMES.tournaments,
        errorMessages: {
          notFound: 'No tournaments available.',
          generic: 'Failed to load tournaments.',
        },
      }),
    );
  });

  it('fetches tournaments through the query function', async () => {
    renderHook(() => useTournaments());

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    mockedGetTournaments.mockResolvedValueOnce(tournaments);

    await queryOptions.queryFn();

    expect(mockedGetTournaments).toHaveBeenCalledTimes(1);
    expect(mockedGetTournaments).toHaveBeenCalledWith();
  });

  it('returns an empty tournament list when query data is missing', () => {
    mockApiQueryResult({ data: undefined });

    const { result } = renderHook(() => useTournaments());

    expect(result.current.tournaments).toEqual([]);
  });

  it('returns tournaments when query data exists', () => {
    mockApiQueryResult({ data: tournaments });

    const { result } = renderHook(() => useTournaments());

    expect(result.current.tournaments).toEqual(tournaments);
    expect(result.current.tournaments[0].name).toBe('FIFA World Cup');
    expect(result.current.tournaments[1].logo_url).toBe('https://example.com/copa.png');
  });

  it('maps loading, refreshing, error, retry, and canRetry from useApiQuery', () => {
    const error = new Error('Failed to load tournaments.');

    mockApiQueryResult({
      data: tournaments,
      isInitialLoading: true,
      isRefreshing: true,
      displayError: error,
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() => useTournaments());

    expect(result.current).toEqual({
      tournaments,
      isLoading: true,
      isRefreshing: true,
      error,
      refetch: retry,
      canRetry: true,
    });
  });

  it('does not expose retry when useApiQuery marks the error as non-retryable', () => {
    mockApiQueryResult({
      data: undefined,
      displayError: new Error('No tournaments available.'),
      canRetry: false,
    });

    const { result } = renderHook(() => useTournaments());

    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error?.message).toBe('No tournaments available.');
    expect(result.current.canRetry).toBe(false);
    expect(result.current.refetch).toBe(retry);
  });
});
