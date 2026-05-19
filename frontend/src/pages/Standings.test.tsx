import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import Standings from './Standings';
import { useStandings } from '@/hooks/useStandings';

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

vi.mock('@/components/standings/StandingsSkeleton', () => ({
  default: () => <div>Standings Skeleton Mock</div>,
}));

const mockedUseStandings = vi.mocked(useStandings);

describe('Standings', () => {
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

  it('renders the standings page heading and selected tournament description', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
    });

    render(<Standings />);

    expect(screen.getByRole('heading', { name: 'Standings' })).toBeInTheDocument();
    expect(screen.getByText(/FIFA World Cup 2026/i)).toBeInTheDocument();
  });

  it('renders the skeleton while standings are loading', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: true,
      error: null,
    });

    render(<Standings />);

    expect(screen.getByText('Standings Skeleton Mock')).toBeInTheDocument();
    expect(screen.queryByText('Legend Mock')).not.toBeInTheDocument();
    expect(screen.queryByText('GroupGrid Mock')).not.toBeInTheDocument();
  });

  it('renders the legend and grid after standings load', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
    });

    render(<Standings />);

    expect(screen.getByText('Legend Mock')).toBeInTheDocument();
    expect(screen.getByText('GroupGrid Mock')).toBeInTheDocument();
    expect(screen.queryByText('Standings Skeleton Mock')).not.toBeInTheDocument();
  });

  it('renders an error message when standings fail to load', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: new Error('Failed to load standings.'),
    });

    render(<Standings />);

    expect(screen.getByText('Failed to load standings.')).toBeInTheDocument();
    expect(screen.queryByText('Legend Mock')).not.toBeInTheDocument();
    expect(screen.queryByText('GroupGrid Mock')).not.toBeInTheDocument();
  });
});
