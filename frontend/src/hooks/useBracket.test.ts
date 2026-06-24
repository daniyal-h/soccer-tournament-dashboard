import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBracket } from '@/api/bracketsApi';

import { EMPTY_BRACKET } from '@/constants/brackets';
import { QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useBracket } from './useBracket';

import { hasBracketMatches } from '@/utils/bracket/bracketHelper';

vi.mock('@/api/bracketsApi', () => ({
  getBracket: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

vi.mock('@/utils/bracket/bracketHelper', () => ({
  hasBracketMatches: vi.fn(),
}));

const mockedUseApiQuery = vi.mocked(useApiQuery);
const mockedGetBracket = vi.mocked(getBracket);
const mockedHasBracketMatches = vi.mocked(hasBracketMatches);

function makeBracket() {
  return {
    round_of_32: [],
    round_of_16: [],
    quarter_final: [],
    semi_final: [],
    third_place: [],
    final: [
      {
        id: 1,
        team_a: {
          id: 1,
          name: 'France',
          short_name: 'FRA',
          logo_url: null,
        },
        team_b: {
          id: 2,
          name: 'Argentina',
          short_name: 'ARG',
          logo_url: null,
        },
        kickoff_time: '2026-07-19T20:00:00Z',
        stage: 'final',
        group: null,
        status: 'scheduled',
        venue: 'MetLife Stadium',
        city: 'New York',
        elapsed: null,
        team_a_score: null,
        team_b_score: null,
        team_a_penalties: null,
        team_b_penalties: null,
      },
    ],
  };
}

function mockQuery(overrides = {}) {
  mockedUseApiQuery.mockReturnValue({
    data: undefined,
    isInitialLoading: false,
    isRefreshing: false,
    displayError: null,
    retry: vi.fn(),
    canRetry: false,
    ...overrides,
  } as never);
}

describe('useBracket', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('configures useApiQuery with bracket query options', () => {
    mockQuery();
    mockedHasBracketMatches.mockReturnValue(false);

    useBracket({ tournament_id: 7 });

    expect(mockedUseApiQuery).toHaveBeenCalledOnce();

    const options = mockedUseApiQuery.mock.calls[0][0];

    expect(options.queryKey).toEqual(queryKeys.bracket.all(7));
    expect(options.staleTime).toBe(QUERY_STALE_TIMES.bracket);
    expect(options.errorMessages).toEqual({
      notFound: 'Bracket was not found',
      generic: 'Failed to load the bracket.',
    });
  });

  it('queryFn fetches the bracket for the selected tournament', async () => {
    mockQuery();
    mockedHasBracketMatches.mockReturnValue(false);

    useBracket({ tournament_id: 7 });

    const options = mockedUseApiQuery.mock.calls[0][0];

    await options.queryFn();

    expect(mockedGetBracket).toHaveBeenCalledOnce();
    expect(mockedGetBracket).toHaveBeenCalledWith({ tournament_id: 7 });
  });

  it('returns loaded bracket data when available', () => {
    const bracket = makeBracket();

    mockQuery({ data: bracket });
    mockedHasBracketMatches.mockReturnValue(true);

    const result = useBracket({ tournament_id: 7 });

    expect(result.bracket).toBe(bracket);
    expect(mockedHasBracketMatches).toHaveBeenCalledWith(bracket);
    expect(result.emptyState).toBeNull();
  });

  it('returns EMPTY_BRACKET when query data is missing', () => {
    mockQuery({ data: undefined });
    mockedHasBracketMatches.mockReturnValue(false);

    const result = useBracket({ tournament_id: 7 });

    expect(result.bracket).toBe(EMPTY_BRACKET);
    expect(mockedHasBracketMatches).toHaveBeenCalledWith(EMPTY_BRACKET);
  });

  it('shows empty state when not loading, no error, and bracket has no matches', () => {
    mockQuery({ data: EMPTY_BRACKET });
    mockedHasBracketMatches.mockReturnValue(false);

    const result = useBracket({ tournament_id: 7 });

    expect(result.emptyState).toBe('The bracket will appear once knockout matches are available.');
  });

  it('does not show empty state while initial loading', () => {
    mockQuery({
      data: EMPTY_BRACKET,
      isInitialLoading: true,
    });
    mockedHasBracketMatches.mockReturnValue(false);

    const result = useBracket({ tournament_id: 7 });

    expect(result.emptyState).toBeNull();
  });

  it('does not show empty state when an error is displayed', () => {
    mockQuery({
      data: EMPTY_BRACKET,
      displayError: 'Failed to load the bracket.',
    });
    mockedHasBracketMatches.mockReturnValue(false);

    const result = useBracket({ tournament_id: 7 });

    expect(result.emptyState).toBeNull();
  });

  it('does not show empty state when bracket has matches', () => {
    const bracket = makeBracket();

    mockQuery({ data: bracket });
    mockedHasBracketMatches.mockReturnValue(true);

    const result = useBracket({ tournament_id: 7 });

    expect(result.emptyState).toBeNull();
  });

  it('returns query state and retry controls', () => {
    const retry = vi.fn();

    mockQuery({
      isInitialLoading: true,
      isRefreshing: true,
      displayError: 'Failed to load the bracket.',
      retry,
      canRetry: true,
    });
    mockedHasBracketMatches.mockReturnValue(false);

    const result = useBracket({ tournament_id: 7 });

    expect(result.isLoading).toBe(true);
    expect(result.isRefreshing).toBe(true);
    expect(result.error).toBe('Failed to load the bracket.');
    expect(result.refetch).toBe(retry);
    expect(result.canRetry).toBe(true);
  });
});
