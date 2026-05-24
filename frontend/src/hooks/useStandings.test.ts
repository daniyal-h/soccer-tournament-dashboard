import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/api/client';
import * as standingsApi from '@/api/standingsApi';

import { useStandings } from './useStandings';

describe('useStandings', () => {
  it('loads standings successfully', async () => {
    vi.spyOn(standingsApi, 'getStandings').mockResolvedValue({
      A: [
        {
          team: {
            id: 1,
            name: 'Argentina',
            short_name: 'ARG',
            logo_url: 'https://flagcdn.com/w40/ar.png',
          },
          position: 1,
          matches_played: 3,
          wins: 3,
          draws: 0,
          losses: 0,
          goals_for: 8,
          goals_against: 2,
          goal_difference: 6,
          points: 9,
        },
      ],
    });

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.standings.A).toHaveLength(1);
    expect(result.current.standings.A[0].team.short_name).toBe('ARG');
  });

  it('passes tournament and group options to the API', async () => {
    const getStandingsSpy = vi.spyOn(standingsApi, 'getStandings').mockResolvedValue({ A: [] });

    const { result } = renderHook(() => useStandings({ tournamentId: 1, group: 'A' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getStandingsSpy).toHaveBeenCalledWith({
      tournamentId: 1,
      group: 'A',
    });
  });

  it('handles missing standings errors', async () => {
    vi.spyOn(standingsApi, 'getStandings').mockRejectedValue(
      new ApiError('No standings found for tournament 1', 404, 'NOT_FOUND'),
    );

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.standings).toEqual({});
    expect(result.current.error?.message).toBe(
      'Groups and rankings will appear once tournament data is available.',
    );
  });

  it('handles rate-limited standings errors', async () => {
    vi.spyOn(standingsApi, 'getStandings').mockRejectedValue(
      new ApiError('Rate limit exceeded. Please try again later.', 429, 'RATE_LIMITED'),
    );

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.standings).toEqual({});
    expect(result.current.error?.message).toBe('Too many requests. Please try again shortly.');
  });

  it('handles network errors', async () => {
    vi.spyOn(standingsApi, 'getStandings').mockRejectedValue(
      new ApiError('Unable to reach the server.', 0, 'NETWORK_ERROR'),
    );

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Unable to reach the server.');
  });

  it('handles unknown errors', async () => {
    vi.spyOn(standingsApi, 'getStandings').mockRejectedValue(new Error('Backend exploded'));

    const { result } = renderHook(() => useStandings({ tournamentId: 1 }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Failed to load standings.');
  });
});
