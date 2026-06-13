import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getTournamentTeams } from '@/api/tournamentTeamsApi';

import { AUTO_REFETCH_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useTournamentTeams } from './useTournamentTeams';

vi.mock('@/api/tournamentTeamsApi', () => ({
  getTournamentTeams: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

const mockUseApiQuery = vi.mocked(useApiQuery);
const mockGetTournamentTeams = vi.mocked(getTournamentTeams);

function getUseApiQueryConfig() {
  return mockUseApiQuery.mock.calls[0][0];
}

function createTournamentTeam(overrides = {}) {
  return {
    team: {
      id: 1,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: null,
    },
    group: 'A',
    final_rank: null,
    stage_reached: null,
    ...overrides,
  };
}

function getRefetchInterval() {
  const config = getUseApiQueryConfig();
  const { refetchInterval } = config;

  if (typeof refetchInterval !== 'function') {
    throw new Error('Expected refetchInterval to be a function');
  }

  return refetchInterval;
}

describe('useTournamentTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseApiQuery.mockReturnValue({
      data: undefined,
      isInitialLoading: false,
      isRefreshing: false,
      displayError: null,
      retry: vi.fn(),
      canRetry: false,
    } as never);
  });

  it('configures useApiQuery with tournament teams query settings', () => {
    useTournamentTeams({ tournament_id: 42 });

    expect(mockUseApiQuery).toHaveBeenCalledOnce();

    const config = getUseApiQueryConfig();

    expect(config.queryKey).toEqual(queryKeys.tournamentTeams.all(42));
    expect(config.staleTime).toBe(QUERY_STALE_TIMES.tournamentTeams);
    expect(config.errorMessages).toEqual({
      notFound: 'No teams were found.',
      generic: 'Failed to load teams.',
    });
  });

  it('queryFn fetches tournament teams for the selected tournament', async () => {
    mockGetTournamentTeams.mockResolvedValueOnce([]);

    useTournamentTeams({ tournament_id: 42 });

    const config = getUseApiQueryConfig();

    await config.queryFn();

    expect(mockGetTournamentTeams).toHaveBeenCalledOnce();
    expect(mockGetTournamentTeams).toHaveBeenCalledWith({ tournament_id: 42 });
  });

  it('returns query data as tournamentTeams', () => {
    const rows = [createTournamentTeam()];

    mockUseApiQuery.mockReturnValueOnce({
      data: rows,
      isInitialLoading: false,
      isRefreshing: true,
      displayError: null,
      retry: vi.fn(),
      canRetry: true,
    } as never);

    const result = useTournamentTeams({ tournament_id: 42 });

    expect(result.tournamentTeams).toEqual(rows);
    expect(result.isLoading).toBe(false);
    expect(result.isRefreshing).toBe(true);
    expect(result.error).toBeNull();
    expect(result.canRetry).toBe(true);
  });

  it('defaults tournamentTeams to an empty array when data is missing', () => {
    const result = useTournamentTeams({ tournament_id: 42 });

    expect(result.tournamentTeams).toEqual([]);
  });

  it('passes retry through as refetch', () => {
    const retry = vi.fn();

    mockUseApiQuery.mockReturnValueOnce({
      data: [],
      isInitialLoading: false,
      isRefreshing: false,
      displayError: null,
      retry,
      canRetry: true,
    } as never);

    const result = useTournamentTeams({ tournament_id: 42 });

    expect(result.refetch).toBe(retry);
  });

  it('does not auto-refetch before data exists', () => {
    useTournamentTeams({ tournament_id: 42 });

    const refetchInterval = getRefetchInterval();

    expect(
      refetchInterval({
        state: {
          data: undefined,
        },
      } as never),
    ).toBe(false);
  });

  it('does not auto-refetch when all teams are unranked before knockouts', () => {
    useTournamentTeams({ tournament_id: 42 });

    const refetchInterval = getRefetchInterval();

    expect(
      refetchInterval({
        state: {
          data: [
            createTournamentTeam({
              final_rank: null,
              stage_reached: null,
            }),
          ],
        },
      } as never),
    ).toBe(false);
  });

  it('auto-refetches when a knockout team is active without a final rank', () => {
    useTournamentTeams({ tournament_id: 42 });

    const refetchInterval = getRefetchInterval();

    expect(
      refetchInterval({
        state: {
          data: [
            createTournamentTeam({
              final_rank: null,
              stage_reached: 'semi_final',
            }),
          ],
        },
      } as never),
    ).toBe(AUTO_REFETCH_TIMES.tournamentTeams);
  });

  it('does not auto-refetch when knockout teams already have final ranks', () => {
    useTournamentTeams({ tournament_id: 42 });

    const refetchInterval = getRefetchInterval();

    expect(
      refetchInterval({
        state: {
          data: [
            createTournamentTeam({
              final_rank: 1,
              stage_reached: 'final',
            }),
            createTournamentTeam({
              final_rank: 5,
              stage_reached: 'quarter_final',
            }),
          ],
        },
      } as never),
    ).toBe(false);
  });

  it('auto-refetches when at least one team is active even if others are finalized', () => {
    useTournamentTeams({ tournament_id: 42 });

    const refetchInterval = getRefetchInterval();

    expect(
      refetchInterval({
        state: {
          data: [
            createTournamentTeam({
              final_rank: 1,
              stage_reached: 'final',
            }),
            createTournamentTeam({
              final_rank: null,
              stage_reached: 'semi_final',
            }),
          ],
        },
      } as never),
    ).toBe(AUTO_REFETCH_TIMES.tournamentTeams);
  });
});
