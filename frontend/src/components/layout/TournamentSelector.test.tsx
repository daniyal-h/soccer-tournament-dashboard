import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import * as tournamentContext from '@/context/TournamentContext';

import TournamentSelector from './TournamentSelector';

describe('TournamentSelector', () => {
  it('renders loading state', () => {
    vi.spyOn(tournamentContext, 'useTournament').mockReturnValue({
      tournaments: [],
      selectedTournamentId: 1,
      selectedTournament: null,
      setSelectedTournamentId: vi.fn(),
      isLoading: true,
      error: null,
    });

    render(<TournamentSelector />);

    expect(screen.getByText(/loading tournaments/i)).toBeInTheDocument();
  });

  it('renders error state', () => {
    vi.spyOn(tournamentContext, 'useTournament').mockReturnValue({
      tournaments: [],
      selectedTournamentId: 1,
      selectedTournament: null,
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: new Error('No tournaments found'),
    });

    render(<TournamentSelector />);

    expect(screen.getByText(/no tournaments found/i)).toBeInTheDocument();
  });
});
