import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import * as tournamentsApi from '@/api/tournamentsApi';

import { useTournaments } from './useTournaments';

describe('useTournaments', () => {
  it('loads tournaments successfully', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue([
      {
        id: 1,
        name: 'FIFA World Cup',
        season: '2026',
        logo_url: null,
        start_date: '2026-06-11',
        end_date: '2026-07-19',
      },
    ]);

    const { result } = renderHook(() => useTournaments());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.tournaments).toEqual([
      {
        id: 1,
        name: 'FIFA World Cup',
        season: '2026',
        logo_url: null,
        start_date: '2026-06-11',
        end_date: '2026-07-19',
      },
    ]);
  });

  it('handles API not-found errors', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockRejectedValue(
      new ApiError('No tournaments found'),
    );

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Failed to load tournaments.');
  });

  it('shows a clear error when no tournaments are found', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockRejectedValue(
      new ApiError('Not found', 404, 'NOT_FOUND'),
    );

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error?.message).toBe('No tournaments available.');
  });

  it('shows a clear error when the network is unavailable', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockRejectedValue(
      new ApiError('Network error', 0, 'NETWORK_ERROR'),
    );

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error?.message).toBe('Unable to reach the server.');
  });

  it('shows a generic error for unexpected failures', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tournaments).toEqual([]);
    expect(result.current.error?.message).toBe('Failed to load tournaments.');
  });
});
