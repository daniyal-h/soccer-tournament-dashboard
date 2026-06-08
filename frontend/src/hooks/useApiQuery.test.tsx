import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useApiQuery } from './useApiQuery';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

vi.mock('@/utils/errors/apiErrorHelper', () => ({
  getApiErrorState: vi.fn(),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('useApiQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns queried data after a successful request', async () => {
    const queryFn = vi.fn().mockResolvedValue(['World Cup']);

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['tournaments'],
          queryFn,
          errorMessages: {
            notFound: 'Not found.',
            generic: 'Failed.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['World Cup']);
    });

    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(result.current.displayError).toBeNull();
    expect(result.current.canRetry).toBe(false);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
    expect(getApiErrorState).not.toHaveBeenCalled();
  });

  it('reports initial loading while the first request is pending', async () => {
    const deferred = createDeferred<string[]>();

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['matches'],
          queryFn: () => deferred.promise,
          errorMessages: {
            notFound: 'Not found.',
            generic: 'Failed.',
          },
        }),
      { wrapper },
    );

    expect(result.current.data).toBeUndefined();
    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isRefreshing).toBe(false);

    await act(async () => {
      deferred.resolve(['match']);
      await deferred.promise;
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(['match']);
    });

    expect(result.current.isInitialLoading).toBe(false);
  });

  it('maps query errors to display errors and retry state', async () => {
    const error = new Error('raw backend error');
    const queryFn = vi.fn().mockRejectedValue(error);

    vi.mocked(getApiErrorState).mockReturnValue({
      message: 'Failed to load tournaments.',
      canRetry: true,
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['tournaments-error'],
          queryFn,
          errorMessages: {
            notFound: 'No tournaments were found.',
            generic: 'Failed to load tournaments.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.displayError?.message).toBe('Failed to load tournaments.');
    });

    expect(result.current.canRetry).toBe(true);
    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.isRefreshing).toBe(false);

    expect(getApiErrorState).toHaveBeenCalledWith(error, {
      notFound: 'No tournaments were found.',
      generic: 'Failed to load tournaments.',
    });
  });

  it('defaults canRetry to false when the error mapper does not allow retry', async () => {
    vi.mocked(getApiErrorState).mockReturnValue({
      message: 'Match was not found.',
      canRetry: false,
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['match-not-found'],
          queryFn: vi.fn().mockRejectedValue(new Error('404')),
          errorMessages: {
            notFound: 'Match was not found.',
            generic: 'Failed to load match.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.displayError?.message).toBe('Match was not found.');
    });

    expect(result.current.canRetry).toBe(false);
  });

  it('retry calls the underlying query function again', async () => {
    const queryFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('cold start'))
      .mockResolvedValueOnce(['World Cup']);

    vi.mocked(getApiErrorState).mockReturnValue({
      message: 'Failed to load tournaments.',
      canRetry: true,
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['retry-tournaments'],
          queryFn,
          errorMessages: {
            notFound: 'No tournaments were found.',
            generic: 'Failed to load tournaments.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.displayError?.message).toBe('Failed to load tournaments.');
    });

    await act(async () => {
      await result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(['World Cup']);
    });

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(result.current.displayError).toBeNull();
    expect(result.current.canRetry).toBe(false);
  });

  it('marks a refetch as refreshing when cached data already exists', async () => {
    const deferred = createDeferred<string[]>();

    const queryFn = vi
      .fn()
      .mockResolvedValueOnce(['cached match'])
      .mockReturnValueOnce(deferred.promise);

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['refreshing-match'],
          queryFn,
          errorMessages: {
            notFound: 'Match was not found.',
            generic: 'Failed to load match.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(['cached match']);
    });

    let retryPromise!: Promise<void>;

    act(() => {
      retryPromise = result.current.retry();
    });

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(true);
    });

    expect(result.current.isInitialLoading).toBe(false);
    expect(result.current.data).toEqual(['cached match']);

    await act(async () => {
      deferred.resolve(['updated match']);
      await retryPromise;
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(['updated match']);
    });

    expect(result.current.isRefreshing).toBe(false);
  });

  it('applies select transformations from query options', async () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () =>
        useApiQuery<string[], number>({
          queryKey: ['selected-count'],
          queryFn: vi.fn().mockResolvedValue(['A', 'B', 'C']),
          select: (items) => items.length,
          errorMessages: {
            notFound: 'Items were not found.',
            generic: 'Failed to load items.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.data).toBe(3);
    });
  });

  it('retry does not refetch tournaments when explicitly passed false', async () => {
    const { wrapper, queryClient } = createWrapper();

    const queryFn = vi
      .fn()
      .mockRejectedValueOnce(new Error('matches failed'))
      .mockResolvedValueOnce(['matches']);

    const refetchQueriesSpy = vi.spyOn(queryClient, 'refetchQueries');

    vi.mocked(getApiErrorState).mockReturnValue({
      message: 'Failed to load matches.',
      canRetry: true,
    });

    const { result } = renderHook(
      () =>
        useApiQuery({
          queryKey: ['matches-explicit-false'],
          queryFn,
          errorMessages: {
            notFound: 'Matches were not found.',
            generic: 'Failed to load matches.',
          },
        }),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.displayError?.message).toBe('Failed to load matches.');
    });

    await act(async () => {
      await result.current.retry(false);
    });

    expect(queryFn).toHaveBeenCalledTimes(2);
    expect(refetchQueriesSpy).not.toHaveBeenCalled();
  });
});
