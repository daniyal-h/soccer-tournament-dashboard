import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMatchEvents } from '@/api/matchEventsApi';

import type { MatchEvent, MatchEventsResponse } from '@/types/matchEvent';
import type { ResponseMetadata } from '@/types/metadata';

import { AUTO_REFETCH_TIMES, QUERY_STALE_TIMES, queryKeys } from '@/constants/queries';

import { useApiQuery } from './useApiQuery';
import { useMatchEvents } from './useMatchEvents';

vi.mock('@/api/matchEventsApi', () => ({
  getMatchEvents: vi.fn(),
}));

vi.mock('./useApiQuery', () => ({
  useApiQuery: vi.fn(),
}));

const mockedGetMatchEvents = vi.mocked(getMatchEvents);
const mockedUseApiQuery = vi.mocked(useApiQuery);

const retry = vi.fn();

const validMetadata: ResponseMetadata = {
  is_delayed: false,
  last_updated: '2026-06-07T12:00:00Z',
  last_successful_refresh: '2026-06-07T11:58:00Z',
  message: null,
};

function createMatchEvent(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return {
    team: {
      id: 1,
      name: 'Belgium',
      short_name: 'BEL',
      logo_url: 'https://media.api-sports.io/football/teams/1.png',
    },
    player: {
      id: 10,
      first_name: 'Kevin',
      last_name: 'De Bruyne',
      photo_url: null,
    },
    secondary_player: null,
    player_name: 'Kevin De Bruyne',
    secondary_player_name: null,
    player_external_id: 123,
    secondary_player_external_id: null,
    event_type: 'goal',
    minute: 24,
    extra_minute: null,
    detail: 'Normal Goal',
    comments: 'right footed shot',
    ...overrides,
  } as MatchEvent;
}

function createMatchEventsResponse(
  overrides: Partial<MatchEventsResponse> = {},
): MatchEventsResponse {
  return {
    data: [createMatchEvent()],
    metadata: validMetadata,
    ...overrides,
  };
}

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

describe('useMatchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiQueryResult();
  });

  it('configures useApiQuery with match events key, fetcher, stale time, and error messages', () => {
    renderHook(() => useMatchEvents({ match_id: 7 }));

    expect(mockedUseApiQuery).toHaveBeenCalledTimes(1);
    expect(mockedUseApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.matches.events(7),
        staleTime: QUERY_STALE_TIMES.matchEvents,
        refetchInterval: false,
        errorMessages: {
          notFound: 'No events were found for this match.',
          generic: 'Failed to load match events.',
        },
      }),
    );
  });

  it('fetches match events using the provided match id', async () => {
    renderHook(() => useMatchEvents({ match_id: 9 }));

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    mockedGetMatchEvents.mockResolvedValueOnce(createMatchEventsResponse());

    await queryOptions.queryFn();

    expect(mockedGetMatchEvents).toHaveBeenCalledTimes(1);
    expect(mockedGetMatchEvents).toHaveBeenCalledWith({ match_id: 9 });
  });

  it('returns empty events and null metadata when query data is missing', () => {
    mockApiQueryResult({ data: undefined });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.matchEvents).toEqual([]);
    expect(result.current.metadata).toBeNull();
  });

  it('returns match events and metadata from query data', () => {
    const event = createMatchEvent({ minute: 52, event_type: 'yellow_card' });
    const response = createMatchEventsResponse({
      data: [event],
      metadata: validMetadata,
    });

    mockApiQueryResult({ data: response });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.matchEvents).toEqual([event]);
    expect(result.current.metadata).toEqual(validMetadata);
    expect(result.current.emptyState).toBeNull();
  });

  it('returns empty state when loading is complete, no error exists, and no events exist', () => {
    mockApiQueryResult({
      data: createMatchEventsResponse({ data: [] }),
      isInitialLoading: false,
      displayError: null,
    });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.emptyState).toBe('Match events will appear once the data is available.');
  });

  it('does not return empty state while initially loading', () => {
    mockApiQueryResult({
      data: createMatchEventsResponse({ data: [] }),
      isInitialLoading: true,
      displayError: null,
    });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.emptyState).toBeNull();
  });

  it('does not return empty state when an error exists', () => {
    mockApiQueryResult({
      data: createMatchEventsResponse({ data: [] }),
      isInitialLoading: false,
      displayError: new Error('Failed to load match events.'),
    });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.emptyState).toBeNull();
  });

  it('maps loading, refreshing, error, retry, and canRetry from useApiQuery', () => {
    const error = new Error('Failed to load match events.');

    mockApiQueryResult({
      data: createMatchEventsResponse(),
      isInitialLoading: true,
      isRefreshing: true,
      displayError: error,
      retry,
      canRetry: true,
    });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(true);
    expect(result.current.error).toBe(error);
    expect(result.current.refetch).toBe(retry);
    expect(result.current.canRetry).toBe(true);
  });

  it('does not auto-refetch when the match is not live', () => {
    renderHook(() => useMatchEvents({ match_id: 1, isLive: false }));

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    expect(queryOptions.refetchInterval).toBe(false);
  });

  it('auto-refetches when the match is live', () => {
    renderHook(() => useMatchEvents({ match_id: 1, isLive: true }));

    const queryOptions = mockedUseApiQuery.mock.calls[0][0];

    expect(queryOptions.refetchInterval).toBe(AUTO_REFETCH_TIMES.matches);
  });

  it('updates query key and query function when match id changes', async () => {
    const { rerender } = renderHook(({ matchId }) => useMatchEvents({ match_id: matchId }), {
      initialProps: { matchId: 1 },
    });

    rerender({ matchId: 2 });

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        queryKey: queryKeys.matches.events(1),
      }),
    );

    expect(mockedUseApiQuery).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        queryKey: queryKeys.matches.events(2),
      }),
    );

    const secondQueryOptions = mockedUseApiQuery.mock.calls[1][0];

    mockedGetMatchEvents.mockResolvedValueOnce(createMatchEventsResponse());

    await secondQueryOptions.queryFn();

    expect(mockedGetMatchEvents).toHaveBeenCalledWith({ match_id: 2 });
  });
});
