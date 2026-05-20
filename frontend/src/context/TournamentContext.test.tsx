import { createElement, type ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as tournamentsApi from '@/api/tournamentsApi';

import { TournamentProvider, useTournament } from './TournamentContext';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(TournamentProvider, null, children);

describe('TournamentContext', () => {
  it('loads selected tournament from localStorage', async () => {
    localStorage.setItem('selectedTournamentId', '1');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue([
      {
        id: 1,
        name: 'FIFA World Cup',
        season: '2026',
      },
    ] as never);

    const { result } = renderHook(() => useTournament(), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedTournamentId).toBe(1);
  });
});
