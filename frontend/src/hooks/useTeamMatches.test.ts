import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamMatches } from '@/api/teamsApi';

import type { Match, MatchStage } from '@/types/match';
import type { TeamMatches } from '@/types/team';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useTeamMatches } from './useTeamMatches';

import { groupMatchesByStage } from '@/utils/teams/teamMatchesHelper';

vi.mock('@/api/teamsApi', () => ({
  getTeamMatches: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('@/utils/teams/teamMatchesHelper', () => ({
  groupMatchesByStage: vi.fn(),
}));

const mockedGetTeamMatches = vi.mocked(getTeamMatches);
const mockedUseApiQuery = vi.mocked(useApiQuery);
const mockedGroupMatchesByStage = vi.mocked(groupMatchesByStage);

const baseMatch: Match = {
  id: 100,
  team_a: {
    id: 1,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: null,
  },
  team_b: {
    id: 2,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: null,
  },
  kickoff_time: '2026-06-12T20:00:00Z',
  stage: 'group',
  group: 'B',
  status: 'finished',
  venue: 'BC Place',
  city: 'Vancouver',
  elapsed: 90,
  team_a_score: 2,
  team_b_score: 1,
  team_a_penalties: null,
  team_b_penalties: null,
};

const finishedMatches: Match[] = Array.from({ length: 6 }, (_, index) => ({
  ...baseMatch,
  id: index + 1,
  status: 'finished',
}));

const scheduledMatch: Match = {
  ...baseMatch,
  id: 99,
  status: 'scheduled',
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
};

const teamMatches: TeamMatches = {
  matches: [finishedMatches[0], scheduledMatch, ...finishedMatches.slice(1)],
};

const groupedMatches = [
  {
    stage: 'group' as MatchStage,
    label: 'Group',
    matches: teamMatches.matches,
  },
];

function mockUseApiQueryReturn(overrides: Partial<ReturnType<typeof useApiQuery>> = {}) {
  mockedUseApiQuery.mockReturnValue({
    data: teamMatches,
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry: vi.fn(),
    canRetry: false,
    ...overrides,
  } as ReturnType<typeof useApiQuery>);
}

function getUseApiQueryOptions() {
  return mockedUseApiQuery.mock.calls[0][0] as {
    queryKey: readonly unknown[];
    queryFn: () => Promise<TeamMatches>;
    staleTime: number;
    errorMessages: {
      notFound: string;
      generic: string;
    };
  };
}

describe('useTeamMatches', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedGroupMatchesByStage.mockReturnValue(groupedMatches);
    mockUseApiQueryReturn();
  });

  it('configures useApiQuery with the team matches query key and stale time', () => {
    renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    const options = getUseApiQueryOptions();

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(options.queryKey).toEqual(queryKeys.teams.matches(12, 34));
    expect(options.staleTime).toBe(QUERY_STALE_TIMES.teams);
  });

  it('configures team matches specific error messages', () => {
    renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    const options = getUseApiQueryOptions();

    expect(options.errorMessages).toEqual({
      notFound: 'Team was not found.',
      generic: 'Failed to load team matches.',
    });
  });

  it('uses the query function to fetch the requested team matches', async () => {
    mockedGetTeamMatches.mockResolvedValueOnce(teamMatches);

    renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    const options = getUseApiQueryOptions();

    await expect(options.queryFn()).resolves.toEqual(teamMatches);

    expect(mockedGetTeamMatches).toHaveBeenCalledTimes(1);
    expect(mockedGetTeamMatches).toHaveBeenCalledWith({
      tournament_id: 12,
      team_id: 34,
    });
  });

  it('groups matches by stage', () => {
    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(mockedGroupMatchesByStage).toHaveBeenCalledTimes(1);
    expect(mockedGroupMatchesByStage).toHaveBeenCalledWith(teamMatches.matches);
    expect(result.current.groupedMatches).toEqual(groupedMatches);
  });

  it('uses an empty matches list when query data is null', () => {
    mockUseApiQueryReturn({ data: null });
    mockedGroupMatchesByStage.mockReturnValueOnce([]);

    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(mockedGroupMatchesByStage).toHaveBeenCalledWith([]);
    expect(result.current.groupedMatches).toEqual([]);
    expect(result.current.lastFiveMatches).toEqual([]);
  });

  it('returns only the last five finished matches for recent form', () => {
    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.lastFiveMatches.map((match) => match.id)).toEqual([2, 3, 4, 5, 6]);
    expect(result.current.lastFiveMatches).not.toContain(scheduledMatch);
  });

  it('does not return an empty state while initially loading', () => {
    mockUseApiQueryReturn({
      data: { matches: [] },
      isInitialLoading: true,
    });
    mockedGroupMatchesByStage.mockReturnValueOnce([]);

    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });

  it('does not return an empty state when there is an error', () => {
    mockUseApiQueryReturn({
      data: { matches: [] },
      displayError: new Error('Failed to load team matches.'),
    });
    mockedGroupMatchesByStage.mockReturnValueOnce([]);

    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });

  it('returns an empty state when loading is complete, there is no error, and there are no matches', () => {
    mockUseApiQueryReturn({
      data: { matches: [] },
      isInitialLoading: false,
      displayError: null,
    });
    mockedGroupMatchesByStage.mockReturnValueOnce([]);

    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.emptyState).toBe(
      'Team matches will appear once tournament data is available.',
    );
  });

  it('maps loading, refreshing, error, retry, and retry eligibility state', () => {
    const retry = vi.fn();

    mockUseApiQueryReturn({
      isInitialLoading: true,
      isRefreshing: true,
      displayError: new Error('Failed to load team matches.'),
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() =>
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.error?.message).toBe('Failed to load team matches.');
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
      useTeamMatches({
        tournament_id: 12,
        team_id: 34,
      }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.canRetry).toBe(false);
  });
});
