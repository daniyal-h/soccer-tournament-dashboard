import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useMatch } from '@/hooks/useMatch';

import { getMatch } from '@/api/matchesApi';

import type { Match } from '@/types/match';

import { getApiErrorState } from '@/utils/errors/apiErrorHelper';

vi.mock('@/api/matchesApi');
vi.mock('@/utils/errors/apiErrorHelper');

const mockGetMatch = vi.mocked(getMatch);
const mockGetApiErrorState = vi.mocked(getApiErrorState);

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  team_a: {
    id: 10,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  team_b: {
    id: 20,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: 'https://example.com/brazil.png',
  },
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

describe('useMatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetApiErrorState.mockReturnValue({
      message: 'Failed to load match.',
      canRetry: true,
    });
  });

  it('starts in loading state before the request settles', () => {
    mockGetMatch.mockReturnValueOnce(new Promise(() => {}));

    const { result } = renderHook(() => useMatch(1));

    expect(result.current.match).toBeNull();
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('fetches the match using the provided match id', async () => {
    mockGetMatch.mockResolvedValueOnce(baseMatch);

    renderHook(() => useMatch(7));

    await waitFor(() => {
      expect(mockGetMatch).toHaveBeenCalledWith({ match_id: 7 });
    });
  });

  it('stores the match and clears loading on successful fetch', async () => {
    mockGetMatch.mockResolvedValueOnce(baseMatch);

    const { result } = renderHook(() => useMatch(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.match).toEqual(baseMatch);
    expect(result.current.error).toBeNull();
    expect(result.current.canRetry).toBe(true);
  });

  it('wraps failed requests with user-facing error state', async () => {
    const apiError = new Error('raw api error');

    mockGetMatch.mockRejectedValueOnce(apiError);
    mockGetApiErrorState.mockReturnValueOnce({
      message: 'Match was not found.',
      canRetry: false,
    });

    const { result } = renderHook(() => useMatch(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetApiErrorState).toHaveBeenCalledWith(apiError, {
      notFound: 'Match was not found.',
      generic: 'Failed to load match.',
    });

    expect(result.current.match).toBeNull();
    expect(result.current.error).toEqual(new Error('Match was not found.'));
    expect(result.current.canRetry).toBe(false);
  });

  it('clears a previous error and reloads match when refetch succeeds', async () => {
    mockGetMatch.mockRejectedValueOnce(new Error('first failure')).mockResolvedValueOnce(baseMatch);

    mockGetApiErrorState.mockReturnValueOnce({
      message: 'Failed to load match.',
      canRetry: true,
    });

    const { result } = renderHook(() => useMatch(1));

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Failed to load match.');
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.match).toEqual(baseMatch);
    expect(result.current.error).toBeNull();
    expect(result.current.canRetry).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('sets loading true during manual refetch', async () => {
    let resolveRefetch: (match: Match) => void = () => {};

    mockGetMatch.mockResolvedValueOnce(baseMatch).mockReturnValueOnce(
      new Promise<Match>((resolve) => {
        resolveRefetch = resolve;
      }),
    );

    const { result } = renderHook(() => useMatch(1));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      void result.current.refetch();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.canRetry).toBe(true);

    await act(async () => {
      resolveRefetch({
        ...baseMatch,
        id: 2,
      });
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.match?.id).toBe(2);
  });

  it('refetch uses the latest match id after rerender', async () => {
    mockGetMatch.mockResolvedValue(baseMatch);

    const { result, rerender } = renderHook(({ matchId }) => useMatch(matchId), {
      initialProps: { matchId: 1 },
    });

    await waitFor(() => {
      expect(mockGetMatch).toHaveBeenCalledWith({ match_id: 1 });
    });

    rerender({ matchId: 2 });

    await waitFor(() => {
      expect(mockGetMatch).toHaveBeenCalledWith({ match_id: 2 });
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockGetMatch).toHaveBeenLastCalledWith({ match_id: 2 });
  });

  it('sets match to null when refetch fails after a previous success', async () => {
    mockGetMatch
      .mockResolvedValueOnce(baseMatch)
      .mockRejectedValueOnce(new Error('second failure'));

    mockGetApiErrorState.mockReturnValueOnce({
      message: 'Failed to load match.',
      canRetry: true,
    });

    const { result } = renderHook(() => useMatch(1));

    await waitFor(() => {
      expect(result.current.match).toEqual(baseMatch);
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.match).toBeNull();
    expect(result.current.error?.message).toBe('Failed to load match.');
    expect(result.current.isLoading).toBe(false);
  });
});
