import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { usePlayerLeaderboard } from '@/hooks/usePlayerLeaderboard';

import type { CategoryType } from '@/types/playerLeaderboard';

import PlayerLeaderboardSection from './PlayerLeaderboardSection';

vi.mock('@/hooks/usePlayerLeaderboard', () => ({
  usePlayerLeaderboard: vi.fn(),
}));

vi.mock('../feedback/ErrorState', () => ({
  default: ({
    title,
    description,
    onAction,
  }: {
    title: string;
    description: string;
    onAction?: () => void;
  }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{description}</p>
      {onAction && (
        <button type="button" onClick={onAction}>
          Retry
        </button>
      )}
    </div>
  ),
}));

vi.mock('../feedback/EmptyState', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

vi.mock('./PlayerLeaderboardSkeleton', () => ({
  default: () => <div data-testid="leaderboard-skeleton">Skeleton</div>,
}));

vi.mock('./PlayerLeaderboardList', () => ({
  default: ({
    category,
    players,
  }: {
    category: string;
    players: Array<{ player: { display_name: string } }>;
  }) => (
    <div data-testid="leaderboard-list">
      <span data-testid="list-category">{category}</span>
      <span data-testid="list-count">{players.length}</span>
      {players.map((entry) => (
        <span key={entry.player.display_name}>{entry.player.display_name}</span>
      ))}
    </div>
  ),
}));

const mockedUsePlayerLeaderboard = vi.mocked(usePlayerLeaderboard);

const leaderboard = {
  category: 'goals' as CategoryType,
  leaderboard: [
    {
      rank: 1,
      value: 8,
      player: {
        id: 1539,
        display_name: 'Kylian Mbappé',
        photo_url: 'https://example.com/mbappe.png',
      },
      team: {
        id: 2,
        name: 'France',
        short_name: 'FRA',
        logo_url: 'https://example.com/france.png',
      },
      appearances: 7,
      minutes_played: 597,
      rating: 7.61,
    },
  ],
};

function mockHook(overrides = {}) {
  const refetch = vi.fn();

  mockedUsePlayerLeaderboard.mockReturnValue({
    playerLeaderboard: leaderboard,
    isLoading: false,
    isRefreshing: false,
    error: null,
    emptyState: null,
    refetch,
    canRetry: true,
    ...overrides,
  });

  return { refetch };
}

describe('PlayerLeaderboardSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls usePlayerLeaderboard with tournament id and category', () => {
    mockHook();

    render(
      <PlayerLeaderboardSection
        tournamentId={12}
        category="yellow_cards"
        hasTournamentError={false}
      />,
    );

    expect(mockedUsePlayerLeaderboard).toHaveBeenCalledOnce();
    expect(mockedUsePlayerLeaderboard).toHaveBeenCalledWith({
      tournament_id: 12,
      category: 'yellow_cards',
    });
  });

  it('renders leaderboard title, description, and list on success', () => {
    mockHook();

    render(
      <PlayerLeaderboardSection tournamentId={1} category="goals" hasTournamentError={false} />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Top Scorers' })).toBeInTheDocument();
    expect(
      screen.getByText('Tournament goal leaders ranked by total goals scored.'),
    ).toBeInTheDocument();

    expect(screen.getByTestId('leaderboard-list')).toBeInTheDocument();
    expect(screen.getByTestId('list-category')).toHaveTextContent('goals');
    expect(screen.getByTestId('list-count')).toHaveTextContent('1');
    expect(screen.getByText('Kylian Mbappé')).toBeInTheDocument();
  });

  it('renders category-specific loading state and skeleton', () => {
    mockHook({
      isLoading: true,
      playerLeaderboard: null,
    });

    render(
      <PlayerLeaderboardSection tournamentId={1} category="assists" hasTournamentError={false} />,
    );

    expect(screen.getByRole('heading', { level: 2, name: 'Top Assists' })).toBeInTheDocument();
    expect(screen.getByText('Loading top playmakers...')).toBeInTheDocument();
    expect(screen.getByTestId('leaderboard-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard-list')).not.toBeInTheDocument();
  });

  it('renders category-specific empty state', () => {
    mockHook({
      playerLeaderboard: null,
      emptyState: 'No goals have been recorded yet.',
    });

    render(
      <PlayerLeaderboardSection tournamentId={1} category="goals" hasTournamentError={false} />,
    );

    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'No Top Scorers Data' }),
    ).toBeInTheDocument();
    expect(screen.getByText('No goals have been recorded yet.')).toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard-list')).not.toBeInTheDocument();
  });

  it('renders retryable error state and passes tournament error flag to refetch', async () => {
    const user = userEvent.setup();
    const { refetch } = mockHook({
      error: new Error('Failed to load leaderboard.'),
      canRetry: true,
      playerLeaderboard: null,
    });

    render(
      <PlayerLeaderboardSection
        tournamentId={1}
        category="yellow_cards"
        hasTournamentError={true}
      />,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Yellow Cards Unavailable' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Failed to load leaderboard.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(refetch).toHaveBeenCalledOnce();
    expect(refetch).toHaveBeenCalledWith(true);
  });

  it('does not render retry action when retry is not allowed', () => {
    mockHook({
      error: new Error('Nope.'),
      canRetry: false,
      playerLeaderboard: null,
    });

    render(
      <PlayerLeaderboardSection tournamentId={1} category="assists" hasTournamentError={false} />,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('renders fallback error when loaded data is unexpectedly null', () => {
    mockHook({
      playerLeaderboard: null,
      isLoading: false,
      error: null,
      emptyState: null,
    });

    render(
      <PlayerLeaderboardSection tournamentId={1} category="goals" hasTournamentError={false} />,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Top Scorers Unavailable' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Failed to load leaderboard.')).toBeInTheDocument();
  });

  it('prioritizes error over loading, empty, and data states', () => {
    mockHook({
      error: new Error('Error wins.'),
      isLoading: true,
      emptyState: 'Empty loses.',
      playerLeaderboard: leaderboard,
    });

    render(
      <PlayerLeaderboardSection tournamentId={1} category="goals" hasTournamentError={false} />,
    );

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.getByText('Error wins.')).toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard-list')).not.toBeInTheDocument();
  });

  it('prioritizes loading over empty state and data when no error exists', () => {
    mockHook({
      error: null,
      isLoading: true,
      emptyState: 'Empty loses.',
      playerLeaderboard: leaderboard,
    });

    render(
      <PlayerLeaderboardSection tournamentId={1} category="goals" hasTournamentError={false} />,
    );

    expect(screen.getByTestId('leaderboard-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('leaderboard-list')).not.toBeInTheDocument();
  });
});
