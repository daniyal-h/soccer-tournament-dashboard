import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getMatchEvents } from '@/api/matchEventsApi';

import type { MatchEvent, MatchEventsResponse } from '@/types/matchEvent';
import type { ResponseMetadata } from '@/types/metadata';

import { useMatchEvents } from './useMatchEvents';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

vi.mock('@/api/matchEventsApi', () => ({
  getMatchEvents: vi.fn(),
}));

vi.mock('@/utils/errors/apiErrorHelper', () => ({
  getApiErrorState: vi.fn(),
}));

const mockGetMatchEvents = vi.mocked(getMatchEvents);
const mockGetApiErrorState = vi.mocked(getApiErrorState);

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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve;
    reject = promiseReject;
  });

  return { promise, resolve, reject };
}

describe('useMatchEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetApiErrorState.mockReturnValue({
      message: 'Failed to load match events.',
      canRetry: true,
    });
  });

  it('starts in a loading state before the request resolves', () => {
    const deferred = createDeferred<MatchEventsResponse>();
    mockGetMatchEvents.mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    expect(result.current.matchEvents).toEqual([]);
    expect(result.current.metadata).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('fetches match events for the provided match id on mount', async () => {
    mockGetMatchEvents.mockResolvedValueOnce(createMatchEventsResponse());

    renderHook(() => useMatchEvents({ match_id: 9 }));

    await waitFor(() => {
      expect(mockGetMatchEvents).toHaveBeenCalledOnce();
    });
    expect(mockGetMatchEvents).toHaveBeenCalledWith({ match_id: 9 });
  });

  it('stores match events and metadata after a successful response', async () => {
    const event = createMatchEvent({ minute: 52, event_type: 'yellow_card' });
    const metadata: ResponseMetadata = {
      is_delayed: true,
      last_updated: null,
      last_successful_refresh: '2026-06-07T11:58:00Z',
      message: 'Live match events may be delayed because the latest refresh failed.',
    };
    const response = createMatchEventsResponse({ data: [event], metadata });

    mockGetMatchEvents.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.matchEvents).toEqual([event]);
    expect(result.current.metadata).toEqual(metadata);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('sets the empty state, metadata, and disables retry when the response has no events', async () => {
    const response = createMatchEventsResponse({ data: [] });

    mockGetMatchEvents.mockResolvedValueOnce(response);

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.matchEvents).toEqual([]);
    expect(result.current.metadata).toEqual(validMetadata);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBe('Match events will appear once the data is available.');
    expect(result.current.canRetry).toBe(false);
  });

  it('clears stale empty state and enables retry when refetch starts', async () => {
    const deferred = createDeferred<MatchEventsResponse>();

    mockGetMatchEvents
      .mockResolvedValueOnce(createMatchEventsResponse({ data: [] }))
      .mockReturnValueOnce(deferred.promise);

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    await waitFor(() => {
      expect(result.current.emptyState).toBe(
        'Match events will appear once the data is available.',
      );
    });

    void act(() => {
      void result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(true);

    await act(async () => {
      deferred.resolve(createMatchEventsResponse());
      await deferred.promise;
    });
  });

  it('stores api errors using the configured helper message and retry flag', async () => {
    const apiError = new Error('404 from API');

    mockGetMatchEvents.mockRejectedValueOnce(apiError);
    mockGetApiErrorState.mockReturnValueOnce({
      message: 'No events were found for this match.',
      canRetry: false,
    });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetApiErrorState).toHaveBeenCalledOnce();
    expect(mockGetApiErrorState).toHaveBeenCalledWith(apiError, {
      notFound: 'No events were found for this match.',
      generic: 'Failed to load match events.',
    });
    expect(result.current.matchEvents).toEqual([]);
    expect(result.current.metadata).toBeNull();
    expect(result.current.error).toEqual(new Error('No events were found for this match.'));
    expect(result.current.emptyState).toBeNull();
    expect(result.current.canRetry).toBe(false);
  });

  it('clears stale events and metadata when a refetch fails', async () => {
    const originalResponse = createMatchEventsResponse();

    mockGetMatchEvents
      .mockResolvedValueOnce(originalResponse)
      .mockRejectedValueOnce(new Error('Network error'));
    mockGetApiErrorState.mockReturnValueOnce({
      message: 'Failed to load match events.',
      canRetry: true,
    });

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    await waitFor(() => {
      expect(result.current.matchEvents).toEqual(originalResponse.data);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.matchEvents).toEqual([]);
    expect(result.current.metadata).toEqual(null);
    expect(result.current.error).toEqual(new Error('Failed to load match events.'));
    expect(result.current.canRetry).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('does not reject the refetch promise when the request fails', async () => {
    mockGetMatchEvents.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMatchEvents({ match_id: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    mockGetMatchEvents.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await expect(result.current.refetch()).resolves.toBeUndefined();
    });
  });

  it('refetches with the new match id when match_id changes', async () => {
    mockGetMatchEvents
      .mockResolvedValueOnce(
        createMatchEventsResponse({ data: [createMatchEvent({ minute: 10 })] }),
      )
      .mockResolvedValueOnce(
        createMatchEventsResponse({ data: [createMatchEvent({ minute: 80 })] }),
      );

    const { rerender } = renderHook(({ matchId }) => useMatchEvents({ match_id: matchId }), {
      initialProps: { matchId: 1 },
    });

    await waitFor(() => {
      expect(mockGetMatchEvents).toHaveBeenCalledWith({ match_id: 1 });
    });

    rerender({ matchId: 2 });

    await waitFor(() => {
      expect(mockGetMatchEvents).toHaveBeenCalledTimes(2);
    });
    expect(mockGetMatchEvents).toHaveBeenNthCalledWith(2, { match_id: 2 });
  });
});
