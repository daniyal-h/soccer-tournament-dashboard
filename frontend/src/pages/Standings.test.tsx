import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTournament } from '@/context/TournamentContext';

import { useStandings } from '@/hooks/useStandings';

import Standings from './Standings';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

const mockedUseTournament = vi.mocked(useTournament);

vi.mock('@/hooks/useStandings', () => ({
  useStandings: vi.fn(),
}));

vi.mock('@/components/standings/Legend', () => ({
  default: () => <div>Legend Mock</div>,
}));

vi.mock('@/components/standings/GroupGrid', () => ({
  default: ({ standings }: { standings: unknown }) => (
    <div data-testid="group-grid">{JSON.stringify(standings)}</div>
  ),
}));

vi.mock('@/components/feedback/ErrorState', () => ({
  default: ({
    title,
    description,
    onAction,
  }: {
    title: string;
    description: string;
    onAction?: () => void | Promise<void>;
  }) => (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {onAction && (
        <button type="button" onClick={() => void onAction()}>
          Try again
        </button>
      )}
    </div>
  ),
}));

vi.mock('@/components/standings/StandingsSkeleton', () => ({
  default: () => <div>Standings Skeleton Mock</div>,
}));

const mockedUseStandings = vi.mocked(useStandings);

beforeEach(() => {
  vi.clearAllMocks();

  mockedUseTournament.mockReturnValue({
    selectedTournamentId: 1,
    selectedTournament: {
      id: 1,
      name: 'FIFA World Cup 2026',
      season: '2026',
      logo_url: null,
      start_date: '2099-01-01',
      end_date: '2099-07-19',
    },
    tournaments: [],
    setSelectedTournamentId: vi.fn(),
    isLoading: false,
    error: null,
  });
});

describe('Standings', () => {
  it('calls useStandings with the selected tournament id', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
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
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(screen.getByRole('heading', { name: 'Standings' })).toBeInTheDocument();
    expect(screen.getByText(/hasn't started yet/i)).toBeInTheDocument();
  });

  it('renders the skeleton while standings are loading', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
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
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(screen.getByText('Legend Mock')).toBeInTheDocument();
    expect(screen.getByTestId('group-grid')).toHaveTextContent('{}');
    expect(screen.queryByText('Standings Skeleton Mock')).not.toBeInTheDocument();
  });

  it('renders an error message when standings fail to load', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: new Error('Failed to load standings.'),
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(screen.getByText('Failed to load standings.')).toBeInTheDocument();
    expect(screen.queryByText('Legend Mock')).not.toBeInTheDocument();
    expect(screen.queryByText('GroupGrid Mock')).not.toBeInTheDocument();
  });

  it('renders started tournament description', () => {
    vi.mocked(useTournament).mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: {
        id: 1,
        name: 'FIFA World Cup 2026',
        season: '2026',
        logo_url: null,
        start_date: '2024-01-01', // past date
        end_date: '2024-02-01',
      },
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
    });

    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });
    render(<Standings />);

    expect(screen.getByText(/FIFA World Cup 2026/i)).toBeInTheDocument();
  });

  it('passes loaded standings to GroupGrid', () => {
    mockedUseStandings.mockReturnValue({
      standings: {
        A: [
          {
            team: {
              id: 1,
              name: 'Argentina',
              short_name: 'ARG',
              logo_url: 'example.com',
            },
            position: 1,
            matches_played: 3,
            wins: 3,
            draws: 0,
            losses: 0,
            goals_for: 8,
            goals_against: 2,
            goal_difference: 6,
            points: 9,
          },
        ],
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(screen.getByTestId('group-grid')).toHaveTextContent('Argentina');
  });

  it('treats the tournament as not started when current time equals the start date', () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date('2026-06-11T00:00:00Z'));

    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: {
        id: 1,
        name: 'World Cup',
        season: '2026',
        logo_url: null,
        start_date: '2026-06-11T00:00:00Z',
        end_date: '2026-07-19T00:00:00Z',
      },
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
    });

    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(
      screen.getByText(
        "The group stage hasn't started yet. Check back once the tournament kicks off.",
      ),
    ).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('renders the started tournament description with the tournament name', () => {
    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: {
        id: 1,
        name: 'Copa Test',
        season: '2026',
        logo_url: null,
        start_date: '2024-01-01',
        end_date: '2024-02-01',
      },
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
    });

    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(screen.getByText('View group standings for Copa Test.')).toBeInTheDocument();
  });

  it('renders started tournament loading description with tournament name', () => {
    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: {
        id: 1,
        name: 'Copa Test',
        season: '2026',
        logo_url: null,
        start_date: '2024-01-01',
        end_date: '2024-02-01',
      },
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
    });

    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(screen.getByText('View group standings for Copa Test.')).toBeInTheDocument();
    expect(screen.getByText('Standings Skeleton Mock')).toBeInTheDocument();
  });

  it('renders pre-tournament loading description when no tournament is selected', () => {
    mockedUseTournament.mockReturnValue({
      selectedTournamentId: 1,
      selectedTournament: null,
      tournaments: [],
      setSelectedTournamentId: vi.fn(),
      isLoading: false,
      error: null,
    });

    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      canRetry: true,
    });

    render(<Standings />);

    expect(
      screen.getByText(
        "The group stage hasn't started yet. Check back once the tournament kicks off.",
      ),
    ).toBeInTheDocument();
  });

  it('passes retry action to ErrorState when the error is retryable', async () => {
    const refetch = vi.fn();

    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: new Error('Unable to reach the server.'),
      refetch,
      canRetry: true,
    });

    render(<Standings />);

    screen.getByRole('button', { name: 'Try again' }).click();

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('does not render retry action when the error is not retryable', () => {
    mockedUseStandings.mockReturnValue({
      standings: {},
      isLoading: false,
      error: new Error('Groups and rankings will appear once tournament data is available.'),
      refetch: vi.fn(),
      canRetry: false,
    });

    render(<Standings />);

    expect(
      screen.getByText('Groups and rankings will appear once tournament data is available.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });
});
