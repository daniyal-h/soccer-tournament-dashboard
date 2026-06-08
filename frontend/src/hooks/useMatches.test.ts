import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMatches } from '@/api/matchesApi';

import type { Match, MatchGroup } from '@/types/match';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useMatches } from './useMatches';

import { groupMatchesByDay } from '@/utils/matches/matchCardHelper';

vi.mock('@/api/matchesApi', () => ({
  getMatches: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('@/utils/matches/matchCardHelper', () => ({
  groupMatchesByDay: vi.fn(),
}));

const mockedGetMatches = vi.mocked(getMatches);
const mockedUseApiQuery = vi.mocked(useApiQuery);
const mockedGroupMatchesByDay = vi.mocked(groupMatchesByDay);

const retry = vi.fn();

const createMatch = (id: number): Match => ({
  id,
  team_a: {
    id: id * 10,
    name: `Team ${id}A`,
    short_name: `A${id}`,
    logo_url: `a-${id}.png`,
  },
  team_b: {
    id: id * 20,
    name: `Team ${id}B`,
    short_name: `B${id}`,
    logo_url: `b-${id}.png`,
  },
  kickoff_time: `2026-06-${String(id).padStart(2, '0')}T19:00:00Z`,
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: `Venue ${id}`,
  city: `City ${id}`,
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
});

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

describe('useMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiQueryResult();
    mockedGroupMatchesByDay.mockReturnValue([]);
  });

  it('configures useApiQuery with matches query key, fetcher, stale time, and errors', () => {
    renderHook(() => useMatches({ tournament_id: 7 }));

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(mockedUseApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.matches.all(7),
        staleTime: QUERY_STALE_TIMES.matches,
        errorMessages: {
          notFound: 'No matches were found.',
          generic: 'Failed to load matches.',
        },
      }),
    );
  });

  it('fetches matches using the provided tournament id', async () => {
    renderHook(() => useMatches({ tournament_id: 9 }));

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    mockedGetMatches.mockResolvedValueOnce([createMatch(1)]);

    await queryOptions.queryFn();

    expect(mockedGetMatches).toHaveBeenCalledTimes(1);
    expect(mockedGetMatches).toHaveBeenCalledWith({ tournament_id: 9 });
  });

  it('groups returned matches', () => {
    const matches = [createMatch(1), createMatch(2)];
    const groupedMatches: MatchGroup[] = [
      {
        day: '2026-06-01',
        matches,
      },
    ];

    mockApiQueryResult({ data: matches });
    mockedGroupMatchesByDay.mockReturnValue(groupedMatches);

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    expect(mockedGroupMatchesByDay).toHaveBeenCalledTimes(1);
    expect(mockedGroupMatchesByDay).toHaveBeenCalledWith(matches);
    expect(result.current.groupedMatches).toEqual(groupedMatches);
    expect(result.current.emptyState).toBeNull();
  });

  it('uses an empty array when query data is missing', () => {
    mockApiQueryResult({ data: undefined });

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    expect(mockedGroupMatchesByDay).toHaveBeenCalledTimes(1);
    expect(mockedGroupMatchesByDay).toHaveBeenCalledWith([]);
    expect(result.current.groupedMatches).toEqual([]);
  });

  it('returns empty state when loading is complete, no error exists, and no matches exist', () => {
    mockApiQueryResult({
      data: [],
      isInitialLoading: false,
      displayError: null,
    });

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    expect(result.current.emptyState).toBe(
      'The schedule will appear once tournament data is available.',
    );
  });

  it('does not return empty state while initially loading', () => {
    mockApiQueryResult({
      data: [],
      isInitialLoading: true,
      displayError: null,
    });

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    expect(result.current.emptyState).toBeNull();
  });

  it('does not return empty state when an error exists', () => {
    mockApiQueryResult({
      data: [],
      isInitialLoading: false,
      displayError: new Error('Failed to load matches.'),
    });

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    expect(result.current.emptyState).toBeNull();
  });

  it('maps loading, refreshing, error, retry, and canRetry from useApiQuery', () => {
    const error = new Error('Failed to load matches.');

    mockApiQueryResult({
      data: [createMatch(1)],
      isInitialLoading: true,
      isRefreshing: true,
      displayError: error,
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.refetch).toBe(retry);
    expect(result.current.canRetry).toBe(true);
  });

  it('updates query key when tournament id changes', () => {
    const { rerender } = renderHook(
      ({ tournamentId }) => useMatches({ tournament_id: tournamentId }),
      {
        initialProps: { tournamentId: 1 },
      },
    );

    rerender({ tournamentId: 2 });

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.matches.all(1),
      }),
    );

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.matches.all(2),
      }),
    );
  });
});
