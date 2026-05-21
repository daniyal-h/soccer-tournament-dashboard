import { describe, expect, it } from 'vitest';

import type { Tournament } from '@/types/tournament';

import { formatSeason } from '@/utils/layout/tournamentSelectorHelper';

const makeTournament = (start_date: string, end_date: string, season: string): Tournament => ({
  id: 1,
  name: 'Test Tournament',
  season,
  logo_url: null,
  start_date,
  end_date,
});

describe('formatSeason', () => {
  it('returns season as-is when start and end year are the same', () => {
    const t = makeTournament('2024-06-14', '2024-07-14', '2024');
    expect(formatSeason(t)).toBe('2024');
  });

  it('formats split season when start and end year differ', () => {
    const t = makeTournament('2024-08-16', '2025-05-25', '2024');
    expect(formatSeason(t)).toBe('2024/25');
  });

  it('handles AFCON-style tournament spanning late Dec to early Jan', () => {
    const t = makeTournament('2025-12-21', '2026-01-18', '2025');
    expect(formatSeason(t)).toBe('2025/26');
  });

  it('handles century boundary correctly', () => {
    const t = makeTournament('2099-08-01', '2100-05-01', '2099');
    expect(formatSeason(t)).toBe('2099/00');
  });
});
