import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as tournamentsApi from '@/api/tournamentsApi';
import { useTournaments } from './useTournaments';

describe('useTournaments', () => {
  it('loads tournaments successfully', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue([
      {
        id: 1,
        name: 'FIFA World Cup',
        season: '2026',
      },
    ] as never);

    const { result } = renderHook(() => useTournaments());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.tournaments).toHaveLength(1);
  });

  it('handles API errors', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockRejectedValue(new Error('No tournaments found'));

    const { result } = renderHook(() => useTournaments());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe('No tournaments found');
  });
});
