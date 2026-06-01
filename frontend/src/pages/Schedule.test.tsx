import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useTournament } from '@/context/TournamentContext';

import { useMatches } from '@/hooks/useMatches';

import Schedule from './Schedule';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/hooks/useMatches', () => ({
  useMatches: vi.fn(),
}));

vi.mock('@/components/feedback/ErrorState', () => ({
  default: ({
    title,
    description,
    onAction,
  }: {
    title: string;
    description: string;
    onAction?: () => void;
  }) => (
    <div
      data-description={description}
      data-has-action={String(Boolean(onAction))}
      data-testid="error-state"
    >
      {title}
    </div>
  ),
}));

vi.mock('@/components/feedback/EmptyState', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-description={description} data-testid="empty-state">
      {title}
    </div>
  ),
}));

vi.mock('@/components/matches/ScheduleSkeleton', () => ({
  default: () => <div data-testid="schedule-skeleton" />,
}));

vi.mock('@/components/matches/MatchSchedule', () => ({
  default: ({ groupedMatches }: { groupedMatches: unknown[] }) => (
    <div data-count={groupedMatches.length} data-testid="match-schedule" />
  ),
}));

const mockedUseTournament = vi.mocked(useTournament);
const mockedUseMatches = vi.mocked(useMatches);

describe('Schedule', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const defaultTournament = {
    selectedTournamentId: 1,
    selectedTournament: {
      id: 1,
      name: 'FIFA World Cup 2026',
    },
  };

  it('requests matches using the selected tournament id', () => {
    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: false,
      error: null,
      emptyState: 'No matches available',
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    expect(mockedUseMatches).toHaveBeenCalledExactlyOnceWith({
      tournament_id: 1,
    });
  });

  it('renders loading state with heading, description and skeleton', () => {
    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: true,
      error: null,
      emptyState: null,
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();

    expect(screen.getByText(/View upcoming and completed tournament matches/i)).toHaveTextContent(
      'FIFA World Cup 2026',
    );

    expect(screen.getByTestId('schedule-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('match-schedule')).not.toBeInTheDocument();
  });

  it('renders fallback tournament description when no tournament is selected', () => {
    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: null,
    } as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: true,
      error: null,
      emptyState: null,
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    expect(screen.getByText(/View upcoming and completed tournament matches/i)).toHaveTextContent(
      'the selected tournament',
    );
  });

  it('renders error state with retry action when retries are allowed', () => {
    const refetch = vi.fn();

    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: false,
      error: new Error('Backend unavailable'),
      emptyState: null,
      refetch,
      canRetry: true,
    } as never);

    render(<Schedule />);

    const errorState = screen.getByTestId('error-state');

    expect(errorState).toHaveTextContent('Schedule Unavailable');
    expect(errorState).toHaveAttribute('data-description', 'Backend unavailable');
    expect(errorState).toHaveAttribute('data-has-action', 'true');
  });

  it('renders error state without retry action when retries are disabled', () => {
    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: false,
      error: new Error('Rate limited'),
      emptyState: null,
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    expect(screen.getByTestId('error-state')).toHaveAttribute('data-has-action', 'false');
  });

  it('renders empty state when emptyState is provided', () => {
    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: false,
      error: null,
      emptyState: 'No schedule available',
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    const emptyState = screen.getByTestId('empty-state');

    expect(emptyState).toHaveTextContent('Schedule Unavailable');
    expect(emptyState).toHaveAttribute('data-description', 'No schedule available');
  });

  it('renders match schedule when data is available', () => {
    const groupedMatches = [
      {
        day: 'June 11, 2026',
        matches: [{ id: 1 }],
      },
      {
        day: 'June 12, 2026',
        matches: [{ id: 2 }],
      },
    ];

    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches,
      isLoading: false,
      error: null,
      emptyState: null,
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    expect(screen.getByRole('heading', { name: 'Schedule' })).toBeInTheDocument();

    expect(screen.getByTestId('match-schedule')).toHaveAttribute('data-count', '2');

    expect(screen.queryByTestId('schedule-skeleton')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-state')).not.toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });

  it('prioritizes error state over loading state', () => {
    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: true,
      error: new Error('Something failed'),
      emptyState: null,
      refetch: vi.fn(),
      canRetry: true,
    } as never);

    render(<Schedule />);

    expect(screen.getByTestId('error-state')).toBeInTheDocument();
    expect(screen.queryByTestId('schedule-skeleton')).not.toBeInTheDocument();
  });

  it('prioritizes loading state over empty state', () => {
    mockedUseTournament.mockReturnValue(defaultTournament as never);

    mockedUseMatches.mockReturnValue({
      groupedMatches: [],
      isLoading: true,
      error: null,
      emptyState: 'No matches',
      refetch: vi.fn(),
      canRetry: false,
    } as never);

    render(<Schedule />);

    expect(screen.getByTestId('schedule-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('empty-state')).not.toBeInTheDocument();
  });
});
