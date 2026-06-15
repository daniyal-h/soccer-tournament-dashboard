import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamProfile } from '@/api/teamsApi';

import type { TeamProfile } from '@/types/team';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useTeamProfile } from './useTeamProfile';

vi.mock('@/api/teamsApi', () => ({
  getTeamProfile: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

const mockedGetTeamProfile = vi.mocked(getTeamProfile);
const mockedUseApiQuery = vi.mocked(useApiQuery);

interface UseApiQueryCallOptions<TData> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  staleTime: number;
  errorMessages: {
    notFound: string;
    generic: string;
  };
}

const validTeamProfile: TeamProfile = {
  team: {
    id: 34,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  group: 'B',
  standing: {
    position: 2,
    matches_played: 3,
    wins: 2,
    draws: 0,
    losses: 1,
    goals_for: 5,
    goals_against: 2,
    goal_difference: 3,
    points: 6,
  },
};

function mockUseApiQueryReturn(overrides: Partial<ReturnType<typeof useApiQuery>> = {}) {
  mockedUseApiQuery.mockReturnValue({
    data: validTeamProfile,
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry: vi.fn(),
    canRetry: false,
    ...overrides,
  } as ReturnType<typeof useApiQuery>);
}

function getUseApiQueryOptions(): UseApiQueryCallOptions<TeamProfile> {
  return mockedUseApiQuery.mock.calls[0][0] as UseApiQueryCallOptions<TeamProfile>;
}

describe('useTeamProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApiQueryReturn();
  });

  it('configures useApiQuery with the team profile query key and stale time', () => {
    renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    const options = getUseApiQueryOptions();

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(options.queryKey).toEqual(queryKeys.teams.profile(12, 34));
    expect(options.staleTime).toBe(QUERY_STALE_TIMES.teamProfile);
  });

  it('configures team profile specific error messages', () => {
    renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    const options = getUseApiQueryOptions();

    expect(options.errorMessages).toEqual({
      notFound: 'Team was not found.',
      generic: 'Failed to load team profile.',
    });
  });

  it('uses the query function to fetch the requested team profile', async () => {
    mockedGetTeamProfile.mockResolvedValueOnce(validTeamProfile);

    renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    const options = getUseApiQueryOptions();

    await expect(options.queryFn()).resolves.toEqual(validTeamProfile);

    expect(mockedGetTeamProfile).toHaveBeenCalledTimes(1);
    expect(mockedGetTeamProfile).toHaveBeenCalledWith({
      tournament_id: 12,
      team_id: 34,
    });
  });

  it('returns the loaded team profile', () => {
    const { result } = renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.teamProfile).toEqual(validTeamProfile);
  });

  it.each([null, undefined])('returns null when query data is %s', (data) => {
    mockUseApiQueryReturn({ data });

    const { result } = renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.teamProfile).toBeNull();
  });

  it('maps query loading and refreshing state', () => {
    mockUseApiQueryReturn({
      isInitialLoading: true,
      isRefreshing: true,
    });

    const { result } = renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(true);
  });

  it('maps query error and retry state', () => {
    const retry = vi.fn();
    const displayError = new Error('Failed to load team profile.');

    mockUseApiQueryReturn({
      displayError,
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.error).toBe(displayError);
    expect(result.current.refetch).toBe(retry);
    expect(result.current.canRetry).toBe(true);
  });

  it('preserves false loading and retry states', () => {
    mockUseApiQueryReturn({
      isInitialLoading: false,
      isRefreshing: false,
      canRetry: false,
    });

    const { result } = renderHook(() =>
      useTeamProfile({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.canRetry).toBe(false);
  });
});
