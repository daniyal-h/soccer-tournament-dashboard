import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTournament } from '@/context/TournamentContext';

import { useTeamMatches } from '@/hooks/useTeamMatches';

import TeamJourneySection from './TeamJourneySection';

import { getRecentForm } from '@/utils/teams/teamMatchesHelper';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/hooks/useTeamMatches', () => ({
  useTeamMatches: vi.fn(),
}));

vi.mock('@/utils/teams/teamMatchesHelper', () => ({
  getRecentForm: vi.fn(),
}));

vi.mock('./teamJourney/TeamJourneySkeleton', () => ({
  default: () => <div data-testid="team-journey-skeleton">Loading journey</div>,
}));

vi.mock('./teamJourney/RecentForm', () => ({
  default: ({ form }: { form: string[] }) => <div data-testid="recent-form">{form.join(',')}</div>,
}));

vi.mock('./teamJourney/TeamMatchStageAccordion', () => ({
  default: ({ group }: { group: { stage: string; label: string } }) => (
    <div data-testid="stage-accordion">{group.label}</div>
  ),
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
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      {onAction && <button onClick={onAction}>Try again</button>}
    </div>
  ),
}));

vi.mock('../feedback/EmptyState', () => ({
  default: ({ title, description }: { title: string; description: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  ),
}));

const mockedUseTournament = vi.mocked(useTournament);
const mockedUseTeamMatches = vi.mocked(useTeamMatches);
const mockedGetRecentForm = vi.mocked(getRecentForm);

const refetch = vi.fn();

const lastFiveMatches = [
  {
    id: 1,
    team_a: { id: 7, name: 'Canada', short_name: 'CAN', logo_url: null },
    team_b: { id: 8, name: 'Brazil', short_name: 'BRA', logo_url: null },
    kickoff_time: '2026-06-12T20:00:00Z',
    stage: 'group',
    group: 'B',
    status: 'finished',
    venue: 'BC Place',
    city: 'Vancouver',
    elapsed: 90,
    team_a_score: 2,
    team_b_score: 1,
    team_a_penalties: null,
    team_b_penalties: null,
  },
];

const groupedMatches = [
  {
    stage: 'group',
    label: 'Group Stage',
    matches: lastFiveMatches,
  },
  {
    stage: 'quarter_final',
    label: 'Quarter-finals',
    matches: [],
  },
];

function mockTournament(overrides = {}) {
  mockedUseTournament.mockReturnValue({
    selectedTournamentId: 12,
    error: null,
    ...overrides,
  } as ReturnType<typeof useTournament>);
}

function mockTeamMatches(overrides = {}) {
  mockedUseTeamMatches.mockReturnValue({
    groupedMatches,
    lastFiveMatches,
    isLoading: false,
    isRefreshing: false,
    error: null,
    emptyState: null,
    refetch,
    canRetry: false,
    ...overrides,
  } as ReturnType<typeof useTeamMatches>);
}

describe('TeamJourneySection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTournament();
    mockTeamMatches();
    mockedGetRecentForm.mockReturnValue(['W', 'D', 'L']);
  });

  it('requests team matches for the selected tournament and team', () => {
    render(<TeamJourneySection teamId={7} />);

    expect(mockedUseTeamMatches).toHaveBeenCalledTimes(1);
    expect(mockedUseTeamMatches).toHaveBeenCalledWith({
      tournament_id: 12,
      team_id: 7,
    });
  });

  it('renders the loading skeleton while matches are loading', () => {
    mockTeamMatches({ isLoading: true });

    render(<TeamJourneySection teamId={7} />);

    expect(screen.getByTestId('team-journey-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Tournament Journey')).not.toBeInTheDocument();
  });

  it('renders an error state when matches fail to load without retry', () => {
    mockTeamMatches({
      error: new Error('Failed to load team matches.'),
      canRetry: false,
    });

    render(<TeamJourneySection teamId={7} />);

    expect(screen.getByRole('heading', { name: 'Matches Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Failed to load team matches.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('renders a retry action when the match error can be retried', async () => {
    mockTeamMatches({
      error: new Error('Failed to load team matches.'),
      canRetry: true,
    });

    render(<TeamJourneySection teamId={7} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith(false);
  });

  it('passes true to refetch when tournament context has an error', async () => {
    mockTournament({ error: new Error('Tournament failed.') });
    mockTeamMatches({
      error: new Error('Failed to load team matches.'),
      canRetry: true,
    });

    render(<TeamJourneySection teamId={7} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith(true);
  });

  it('renders empty state when the hook returns an empty state message', () => {
    mockTeamMatches({
      emptyState: 'The schedule will appear once tournament data is available.',
    });

    render(<TeamJourneySection teamId={7} />);

    expect(screen.getByRole('heading', { name: 'Matches Unavailable' })).toBeInTheDocument();
    expect(
      screen.getByText('The schedule will appear once tournament data is available.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Tournament Journey')).not.toBeInTheDocument();
  });

  it('derives recent form from the last five matches and selected team', () => {
    render(<TeamJourneySection teamId={7} />);

    expect(mockedGetRecentForm).toHaveBeenCalledTimes(1);
    expect(mockedGetRecentForm).toHaveBeenCalledWith(lastFiveMatches, 7);
    expect(screen.getByTestId('recent-form')).toHaveTextContent('W,D,L');
  });

  it('renders the journey heading, description, recent form, and stage accordions', () => {
    render(<TeamJourneySection teamId={7} />);

    expect(screen.getByText('Tournament Journey')).toBeInTheDocument();
    expect(screen.getByText('Recent form and all matches for this team')).toBeInTheDocument();
    expect(screen.getByTestId('recent-form')).toBeInTheDocument();

    expect(screen.getAllByTestId('stage-accordion')).toHaveLength(2);
    expect(screen.getByText('Group Stage')).toBeInTheDocument();
    expect(screen.getByText('Quarter-finals')).toBeInTheDocument();
  });

  it('does not derive recent form while loading, error, or empty state is rendered', () => {
    mockTeamMatches({ isLoading: true });

    const { rerender } = render(<TeamJourneySection teamId={7} />);

    expect(mockedGetRecentForm).not.toHaveBeenCalled();

    mockTeamMatches({
      isLoading: false,
      error: new Error('Failed to load team matches.'),
    });

    rerender(<TeamJourneySection teamId={7} />);

    expect(mockedGetRecentForm).not.toHaveBeenCalled();

    mockTeamMatches({
      error: null,
      emptyState: 'No matches yet.',
    });

    rerender(<TeamJourneySection teamId={7} />);

    expect(mockedGetRecentForm).not.toHaveBeenCalled();
  });
});
