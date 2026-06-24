import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTournament } from '@/context/TournamentContext';

import { useBracket } from '@/hooks/useBracket';

import Bracket from './Bracket';

import { getBracketRounds } from '@/utils/bracket/bracketHelper';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/hooks/useBracket', () => ({
  useBracket: vi.fn(),
}));

vi.mock('@/utils/bracket/bracketHelper', () => ({
  getBracketRounds: vi.fn(),
}));

vi.mock('@/components/bracket/BracketSkeleton', () => ({
  BracketSkeleton: () => <div>Bracket Skeleton</div>,
}));

vi.mock('@/components/bracket/BracketGrid', () => ({
  BracketGrid: ({ rounds }: { rounds: unknown[] }) => <div>Grid {rounds.length}</div>,
}));

vi.mock('@/components/bracket/BracketTab', () => ({
  default: ({ rounds }: { rounds: unknown[] }) => <div>Tabs {rounds.length}</div>,
}));

const mockedUseTournament = vi.mocked(useTournament);
const mockedUseBracket = vi.mocked(useBracket);
const mockedGetBracketRounds = vi.mocked(getBracketRounds);

const bracket = {
  round_of_32: [],
  round_of_16: [],
  quarter_final: [],
  semi_final: [],
  third_place: [],
  final: [],
};

function setupBracket(overrides = {}) {
  mockedUseBracket.mockReturnValue({
    bracket,
    isLoading: false,
    isRefreshing: false,
    error: null,
    emptyState: null,
    refetch: vi.fn(),
    canRetry: false,
    ...overrides,
  });
}

describe('Bracket page', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      error: null,
    } as never);

    mockedGetBracketRounds.mockReturnValue([
      {
        stage: 'final',
        title: 'Final',
        matches: [],
      },
    ]);
  });

  it('requests bracket data for the selected tournament', () => {
    setupBracket();

    render(<Bracket />);

    expect(mockedUseBracket).toHaveBeenCalledWith({
      tournament_id: 1,
    });
  });

  it('shows loading state with skeleton', () => {
    setupBracket({
      isLoading: true,
    });

    render(<Bracket />);

    expect(screen.getByRole('heading', { name: 'Bracket' })).toBeInTheDocument();

    expect(screen.getByText('Loading the tournament bracket...')).toBeInTheDocument();

    expect(screen.getByText('Bracket Skeleton')).toBeInTheDocument();

    expect(mockedGetBracketRounds).not.toHaveBeenCalled();
  });

  it('shows error state and retries when allowed', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    setupBracket({
      error: new Error('Failed to load bracket'),
      canRetry: true,
      refetch,
    });

    render(<Bracket />);

    expect(screen.getByText('Bracket Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load bracket')).toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(refetch).toHaveBeenCalledWith(false);
  });

  it('does not pass retry action when retry is unavailable', () => {
    const refetch = vi.fn();

    setupBracket({
      error: new Error('Failed to load bracket'),
      canRetry: false,
      refetch,
    });

    render(<Bracket />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(refetch).not.toHaveBeenCalled();
  });

  it('passes tournament error state when retrying', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      error: new Error('Tournament failed'),
    } as never);

    setupBracket({
      error: new Error('Failed to load bracket'),
      canRetry: true,
      refetch,
    });

    render(<Bracket />);

    await user.click(screen.getByRole('button'));

    expect(refetch).toHaveBeenCalledWith(true);
  });

  it('shows empty state', () => {
    setupBracket({
      emptyState: 'The bracket will appear once knockout matches are available.',
    });

    render(<Bracket />);

    expect(screen.getByText('Bracket Coming Soon')).toBeInTheDocument();

    expect(
      screen.getByText('The bracket will appear once knockout matches are available.'),
    ).toBeInTheDocument();

    expect(mockedGetBracketRounds).not.toHaveBeenCalled();
  });

  it('renders bracket tabs and grid with generated rounds', () => {
    setupBracket();

    render(<Bracket />);

    expect(mockedGetBracketRounds).toHaveBeenCalledWith(bracket);

    expect(
      screen.getByText('Follow the knockout journey from the first round to the final.'),
    ).toBeInTheDocument();

    expect(screen.getByText('Tabs 1')).toBeInTheDocument();
    expect(screen.getByText('Grid 1')).toBeInTheDocument();
  });
});
