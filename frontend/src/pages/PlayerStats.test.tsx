import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlayerStats from './PlayerStats';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/components/playerLeaderboards/CategoryPicker', () => ({
  default: ({
    category,
    setCategory,
  }: {
    category: string;
    setCategory: (category: string) => void;
  }) => (
    <div data-testid="category-picker">
      <span data-testid="selected-category">{category}</span>
      <button type="button" onClick={() => setCategory('assists')}>
        Pick Assists
      </button>
      <button type="button" onClick={() => setCategory('yellow_cards')}>
        Pick Yellow Cards
      </button>
    </div>
  ),
}));

vi.mock('@/components/playerLeaderboards/PlayerLeaderboardSection', () => ({
  default: ({
    tournamentId,
    category,
    hasTournamentError,
  }: {
    tournamentId: number;
    category: string;
    hasTournamentError: boolean;
  }) => (
    <div data-testid="leaderboard-section">
      <span data-testid="section-tournament">{tournamentId}</span>
      <span data-testid="section-category">{category}</span>
      <span data-testid="section-has-tournament-error">{String(hasTournamentError)}</span>
    </div>
  ),
}));

import { useTournament } from '@/context/TournamentContext';

const mockedUseTournament = vi.mocked(useTournament);

describe('PlayerStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: null,
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });
  });

  it('renders the page title and description', () => {
    render(<PlayerStats />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Player Statistics',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Explore top players, goals, assists, and tournament records.'),
    ).toBeInTheDocument();
  });

  it('renders category picker and leaderboard section', () => {
    render(<PlayerStats />);

    expect(screen.getByTestId('category-picker')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-section')).toBeInTheDocument();
  });

  it('uses goals as the default selected category', () => {
    render(<PlayerStats />);

    expect(screen.getByTestId('selected-category')).toHaveTextContent('goals');
    expect(screen.getByTestId('section-category')).toHaveTextContent('goals');
  });

  it('passes selected tournament id to leaderboard section', () => {
    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 42,
      selectedTournament: null,
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<PlayerStats />);

    expect(screen.getByTestId('section-tournament')).toHaveTextContent('42');
  });

  it('updates leaderboard category when category picker changes selection', () => {
    render(<PlayerStats />);

    fireEvent.click(screen.getByRole('button', { name: 'Pick Assists' }));

    expect(screen.getByTestId('selected-category')).toHaveTextContent('assists');
    expect(screen.getByTestId('section-category')).toHaveTextContent('assists');

    fireEvent.click(screen.getByRole('button', { name: 'Pick Yellow Cards' }));

    expect(screen.getByTestId('selected-category')).toHaveTextContent('yellow_cards');
    expect(screen.getByTestId('section-category')).toHaveTextContent('yellow_cards');
  });

  it('passes false tournament error flag when tournament context has no error', () => {
    render(<PlayerStats />);

    expect(screen.getByTestId('section-has-tournament-error')).toHaveTextContent('false');
  });

  it('passes true tournament error flag when tournament context has an error', () => {
    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: null,
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: new Error('Tournament failed'),
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<PlayerStats />);

    expect(screen.getByTestId('section-has-tournament-error')).toHaveTextContent('true');
  });
});
