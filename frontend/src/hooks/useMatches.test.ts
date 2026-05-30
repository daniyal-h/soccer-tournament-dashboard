import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import { getMatches } from '@/api/matchesApi';

import { useMatches } from './useMatches';

import { groupMatchesByDay } from '@/utils/matches/matchCardHelper';

vi.mock('@/api/matchesApi', () => ({
  getMatches: vi.fn(),
}));

vi.mock('@/utils/matches/matchCardHelper', () => ({
  groupMatchesByDay: vi.fn(),
}));

const mockedGetMatches = vi.mocked(getMatches);
const mockedGroupMatchesByDay = vi.mocked(groupMatchesByDay);

const createMatch = (id: number) => ({
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
  stage: 'group' as const,
  group: 'A',
  status: 'scheduled' as const,
  venue: `Venue ${id}`,
  city: `City ${id}`,
});

describe('useMatches', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('loads matches for the selected tournament id', async () => {
    const matches = [createMatch(1)];
    const groupedMatches = [{ day: 'Jun 1', matches }];

    mockedGetMatches.mockResolvedValue(matches);
    mockedGroupMatchesByDay.mockReturnValue(groupedMatches);

    const { result } = renderHook(() => useMatches({ tournament_id: 7 }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockedGetMatches).toHaveBeenCalledExactlyOnceWith({ tournament_id: 7 });
    expect(mockedGroupMatchesByDay).toHaveBeenCalledExactlyOnceWith(matches);

    expect(result.current.groupedMatches).toEqual(groupedMatches);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('sets empty state and skips grouping when API returns no matches', async () => {
    mockedGetMatches.mockResolvedValue([]);

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.emptyState).toBe(
      'The schedule will appear once tournament data is available.',
    );
    expect(result.current.error).toBeNull();
    expect(result.current.canRetry).toBe(false);
    expect(mockedGroupMatchesByDay).not.toHaveBeenCalled();
  });

  it('clears stale grouped matches when refetch returns empty data', async () => {
    const matches = [createMatch(1)];
    const groupedMatches = [{ day: 'Jun 1', matches }];

    mockedGetMatches.mockResolvedValueOnce(matches).mockResolvedValueOnce([]);
    mockedGroupMatchesByDay.mockReturnValue(groupedMatches);

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.groupedMatches).toEqual(groupedMatches);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.emptyState).toBe(
      'The schedule will appear once tournament data is available.',
    );
    expect(result.current.error).toBeNull();
    expect(result.current.canRetry).toBe(false);
  });

  it('sets not-found error and disables retry', async () => {
    mockedGetMatches.mockRejectedValue(new ApiError('missing', 404, 'NOT_FOUND'));

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.error).toEqual(new Error('No matches were found.'));
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(false);
  });

  it('sets rate-limit error and keeps retry enabled', async () => {
    mockedGetMatches.mockRejectedValue(new ApiError('too many requests', 429, 'RATE_LIMITED'));

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.error).toEqual(
      new Error('Too many requests. Please wait a moment and try again.'),
    );
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('sets network error and keeps retry enabled', async () => {
    mockedGetMatches.mockRejectedValue(new ApiError('offline', 0, 'NETWORK_ERROR'));

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.error).toEqual(new Error('Unable to reach the server.'));
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('sets generic error for unknown ApiError codes', async () => {
    mockedGetMatches.mockRejectedValue(new ApiError('server exploded', 500, 'UNKNOWN_ERROR'));

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.error).toEqual(new Error('Failed to load matches.'));
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('sets generic error for non-ApiError failures', async () => {
    mockedGetMatches.mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.error).toEqual(new Error('Failed to load matches.'));
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('resets state before refetching', async () => {
    const matches = [createMatch(1)];
    const groupedMatches = [{ day: 'Jun 1', matches }];

    mockedGetMatches
      .mockRejectedValueOnce(new ApiError('missing', 404, 'NOT_FOUND'))
      .mockResolvedValueOnce(matches);

    mockedGroupMatchesByDay.mockReturnValue(groupedMatches);

    const { result } = renderHook(() => useMatches({ tournament_id: 1 }));

    await waitFor(() => {
      expect(result.current.error).toEqual(new Error('No matches were found.'));
    });

    act(() => {
      void result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);

    await waitFor(() => {
      expect(result.current.groupedMatches).toEqual(groupedMatches);
    });
  });

  it('reloads matches when tournament id changes', async () => {
    mockedGetMatches.mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ tournamentId }) => useMatches({ tournament_id: tournamentId }),
      {
        initialProps: { tournamentId: 1 },
      },
    );

    await waitFor(() => {
      expect(mockedGetMatches).toHaveBeenCalledWith({ tournament_id: 1 });
    });

    rerender({ tournamentId: 2 });

    await waitFor(() => {
      expect(mockedGetMatches).toHaveBeenCalledWith({ tournament_id: 2 });
    });

    expect(mockedGetMatches).toHaveBeenCalledTimes(2);
  });
});
