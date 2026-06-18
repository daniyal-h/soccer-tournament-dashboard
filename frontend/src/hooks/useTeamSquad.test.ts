import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTeamSquad } from '@/api/teamsApi';

import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useTeamSquad } from './useTeamSquad';

import { groupSquadByPosition } from '@/utils/teams/teamSquadHelper';

vi.mock('@/api/teamsApi', () => ({
  getTeamSquad: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('@/utils/teams/teamSquadHelper', () => ({
  groupSquadByPosition: vi.fn(),
}));

const mockedUseApiQuery = vi.mocked(useApiQuery);
const mockedGetTeamSquad = vi.mocked(getTeamSquad);
const mockedGroupSquadByPosition = vi.mocked(groupSquadByPosition);

const retry = vi.fn();

const squad = [
  {
    player: {
      id: 10,
      display_name: 'A. Davies',
      first_name: 'Alphonso',
      last_name: 'Davies',
      photo_url: 'https://example.com/davies.png',
      nationality: 'Canada',
      date_of_birth: '2000-11-02',
      height: 183,
    },
    squad_number: 19,
    position: 'DEF',
  },
];

const groupedSquad = [
  {
    position: 'DEF',
    label: 'Defenders',
    squad,
  },
];

function mockQuery(overrides = {}) {
  mockedUseApiQuery.mockReturnValue({
    data: { squad },
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry,
    canRetry: true,
    ...overrides,
  } as never);
}

describe('useTeamSquad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGroupSquadByPosition.mockReturnValue(groupedSquad as never);
  });

  it('configures the api query with the team squad key, fetcher, stale time, and errors', () => {
    mockQuery();

    renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(mockedUseApiQuery).toHaveBeenCalledWith({
      queryKey: queryKeys.teams.squad(1, 32),
      queryFn: expect.any(Function),
      staleTime: QUERY_STALE_TIMES.teams,
      errorMessages: {
        notFound: 'Team was not found.',
        generic: 'Failed to load team squad.',
      },
    });
  });

  it('uses getTeamSquad as the query function with tournament and team ids', async () => {
    mockQuery();

    renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    const queryConfig = mockedUseApiQuery.mock.calls[0][0];

    await queryConfig.queryFn();

    expect(mockedGetTeamSquad).toHaveBeenCalledTimes(1);
    expect(mockedGetTeamSquad).toHaveBeenCalledWith({
      tournament_id: 1,
      team_id: 32,
    });
  });

  it('groups the squad returned from the query data', () => {
    mockQuery();

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(mockedGroupSquadByPosition).toHaveBeenCalledOnce();
    expect(mockedGroupSquadByPosition).toHaveBeenCalledWith(squad);
    expect(result.current.groupedSquad).toBe(groupedSquad);
  });

  it('groups an empty squad when query data is null', () => {
    mockedUseApiQuery.mockReturnValue({
      data: null,
      isInitialLoading: false,
      isRefreshing: false,
      displayError: null,
      retry,
      canRetry: true,
    } as never);

    mockedGroupSquadByPosition.mockReturnValue([] as never);

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(mockedGroupSquadByPosition).toHaveBeenCalledWith([]);
    expect(result.current.groupedSquad).toEqual([]);
  });

  it('returns loading, refreshing, error, retry, and canRetry state from the api query', () => {
    const error = 'Failed to load team squad.';

    mockQuery({
      isInitialLoading: true,
      isRefreshing: true,
      displayError: error,
      canRetry: false,
    });

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.refetch).toBe(retry);
    expect(result.current.canRetry).toBe(false);
  });

  it('returns an empty state when loading is complete, there is no error, and the squad is empty', () => {
    mockQuery({
      data: { squad: [] },
    });

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(result.current.emptyState).toBe(
      'The squad will appear once tournament data is available.',
    );
  });

  it('does not return an empty state while initially loading', () => {
    mockQuery({
      data: { squad: [] },
      isInitialLoading: true,
    });

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });

  it('does not return an empty state when there is an error', () => {
    mockQuery({
      data: { squad: [] },
      displayError: 'Failed to load team squad.',
    });

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });

  it('does not return an empty state when squad has members', () => {
    mockQuery();

    const { result } = renderHook(() =>
      useTeamSquad({
        tournament_id: 1,
        team_id: 32,
      }),
    );

    expect(result.current.emptyState).toBeNull();
  });
});
