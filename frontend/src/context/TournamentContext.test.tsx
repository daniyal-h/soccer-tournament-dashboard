import { createElement, type ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import * as tournamentsApi from '@/api/tournamentsApi';

import { DEFAULT_TOURNAMENT_ID } from '@/constants/tournaments';

import { TournamentProvider, useTournament } from './TournamentContext';

const wrapper = ({ children }: { children: ReactNode }) =>
  createElement(TournamentProvider, null, children);

const tournaments = [
  {
    id: 1,
    name: 'FIFA World Cup',
    season: '2026',
    logo_url: null,
    start_date: '2026-06-11',
    end_date: '2026-07-19',
  },
  {
    id: 2,
    name: 'Champions League',
    season: '2025',
    logo_url: null,
    start_date: '2025-09-01',
    end_date: '2026-05-31',
  },
];

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('TournamentContext', () => {
  it('loads selected tournament from localStorage', async () => {
    localStorage.setItem('selectedTournamentId', '1');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedTournamentId).toBe(1);
    expect(result.current.selectedTournament?.name).toBe('FIFA World Cup');
  });

  it('keeps selected tournament ID when it exists in loaded tournaments', async () => {
    localStorage.setItem('selectedTournamentId', '2');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedTournamentId).toBe(2);
    expect(localStorage.getItem('selectedTournamentId')).toBe('2');
  });

  it('falls back to default tournament when localStorage is empty', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedTournamentId).toBe(DEFAULT_TOURNAMENT_ID);
  });

  it('falls back to default tournament when localStorage value is invalid', async () => {
    localStorage.setItem('selectedTournamentId', 'abc');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedTournamentId).toBe(DEFAULT_TOURNAMENT_ID);
    expect(localStorage.getItem('selectedTournamentId')).toBe(String(DEFAULT_TOURNAMENT_ID));
  });

  it('uses default tournament ID when localStorage is missing', () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    expect(result.current.selectedTournamentId).toBe(DEFAULT_TOURNAMENT_ID);
  });

  it('initializes selected tournament ID from localStorage synchronously', () => {
    localStorage.setItem('selectedTournamentId', '2');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    expect(result.current.selectedTournamentId).toBe(2);
  });

  it('updates selected tournament and persists it to localStorage', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.setSelectedTournamentId(2);
    });

    expect(result.current.selectedTournamentId).toBe(2);
    expect(result.current.selectedTournament?.name).toBe('Champions League');
    expect(localStorage.getItem('selectedTournamentId')).toBe('2');
  });

  it('resets to default when stored tournament does not exist after loading', async () => {
    localStorage.setItem('selectedTournamentId', '999');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.selectedTournamentId).toBe(DEFAULT_TOURNAMENT_ID);
    });

    expect(localStorage.getItem('selectedTournamentId')).toBe(String(DEFAULT_TOURNAMENT_ID));
  });

  it('uses default tournament ID when localStorage value is zero', () => {
    localStorage.setItem('selectedTournamentId', '0');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    expect(result.current.selectedTournamentId).toBe(DEFAULT_TOURNAMENT_ID);
  });

  it('does not validate selected ID while tournaments are still loading', () => {
    localStorage.setItem('selectedTournamentId', '999');

    vi.spyOn(tournamentsApi, 'getTournaments').mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTournament(), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.selectedTournamentId).toBe(999);
    expect(localStorage.getItem('selectedTournamentId')).toBe('999');
  });

  it('resets invalid selected tournament ID to the default after tournaments load', async () => {
    localStorage.setItem('selectedTournamentId', '999');

    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue(tournaments);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.selectedTournamentId).toBe(DEFAULT_TOURNAMENT_ID);
    });

    expect(localStorage.getItem('selectedTournamentId')).toBe(String(DEFAULT_TOURNAMENT_ID));
  });

  it('returns null selected tournament before tournaments are available', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockResolvedValue([]);

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.selectedTournament).toBeNull();
  });

  it('exposes loading errors from useTournaments', async () => {
    vi.spyOn(tournamentsApi, 'getTournaments').mockRejectedValue(new Error('boom'));

    const { result } = renderHook(() => useTournament(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error?.message).toBe('Failed to load tournaments.');
  });

  it('throws when useTournament is used outside TournamentProvider', () => {
    expect(() => renderHook(() => useTournament())).toThrow(
      'useTournamentContext must be used within TournamentProvider',
    );
  });
});
