import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Standings from './Standings';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: () => ({
    selectedTournamentId: 1,
    selectedTournament: {
      id: 1,
      name: 'FIFA World Cup 2026',
      season: '2026',
      logo_url: null,
      start_date: '2026-06-11',
      end_date: '2026-07-19',
    },
  }),
}));

vi.mock('@/hooks/useStandings', () => ({
  useStandings: vi.fn(),
}));

vi.mock('@/components/standings/Legend', () => ({
  default: () => <div>Legend Mock</div>,
}));

vi.mock('@/components/standings/GroupGrid', () => ({
  default: () => <div>GroupGrid Mock</div>,
}));

import { useStandings } from '@/hooks/useStandings';

const mockedUseStandings = vi.mocked(useStandings);

describe('Standings', () => {
  it('renders the standings page content', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
    });

    render(<Standings />);

    expect(screen.getByRole('heading', { name: 'Standings' })).toBeInTheDocument();
    expect(screen.getByText(/FIFA World Cup 2026/i)).toBeInTheDocument();
    expect(screen.getByText('Legend Mock')).toBeInTheDocument();
    expect(screen.getByText('GroupGrid Mock')).toBeInTheDocument();
  });

  it('renders loading state while standings are loading', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: true,
      error: null,
    });

    render(<Standings />);

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders error state when standings fail to load', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: new Error('Failed to load standings.'),
    });

    render(<Standings />);

    expect(screen.getByText('Failed to load standings.')).toBeInTheDocument();
  });

  it('calls useStandings with the selected tournament id', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
    });

    render(<Standings />);

    expect(mockedUseStandings).toHaveBeenCalledWith({
      tournamentId: 1,
    });
  });
});
