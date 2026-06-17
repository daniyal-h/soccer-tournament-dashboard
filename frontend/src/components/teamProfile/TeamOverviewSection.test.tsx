import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTournament } from '@/context/TournamentContext';

import { useTeamProfile } from '@/hooks/useTeamProfile';

import TeamOverviewSection from './TeamOverviewSection';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/hooks/useTeamProfile', () => ({
  useTeamProfile: vi.fn(),
}));

vi.mock('./teamOverview/TeamProfileSkeleton', () => ({
  default: () => <div data-testid="team-profile-skeleton">Loading profile</div>,
}));

vi.mock('./teamOverview/TeamProfileHeader', () => ({
  default: ({ teamProfile }: { teamProfile: { team: { name: string } } }) => (
    <div data-testid="team-profile-header">{teamProfile.team.name}</div>
  ),
}));

vi.mock('./teamOverview/TeamStageSummary', () => ({
  default: ({ standing }: { standing: { points: number } }) => (
    <div data-testid="team-stage-summary">Points: {standing.points}</div>
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
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

const mockedUseTournament = vi.mocked(useTournament);
const mockedUseTeamProfile = vi.mocked(useTeamProfile);

const refetch = vi.fn();

const validTeamProfile = {
  team: {
    id: 7,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  group: 'B',
  standing: {
    position: 2,
    matches_played: 3,
    wins: 2,
    draws: 0,
    losses: 1,
    goals_for: 5,
    goals_against: 2,
    goal_difference: 3,
    points: 6,
  },
};

function mockTournament(overrides = {}) {
  mockedUseTournament.mockReturnValue({
    selectedTournamentId: 12,
    error: null,
    ...overrides,
  } as ReturnType<typeof useTournament>);
}

function mockTeamProfile(overrides = {}) {
  mockedUseTeamProfile.mockReturnValue({
    teamProfile: validTeamProfile,
    isLoading: false,
    isRefreshing: false,
    error: null,
    refetch,
    canRetry: false,
    ...overrides,
  } as ReturnType<typeof useTeamProfile>);
}

describe('TeamOverviewSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTournament();
    mockTeamProfile();
  });

  it('requests the team profile for the selected tournament and team', () => {
    render(<TeamOverviewSection teamId={34} />);

    expect(mockedUseTeamProfile).toHaveBeenCalledTimes(1);
    expect(mockedUseTeamProfile).toHaveBeenCalledWith({
      tournament_id: 12,
      team_id: 34,
    });
  });

  it('renders the loading skeleton while the profile is loading', () => {
    mockTeamProfile({ isLoading: true });

    render(<TeamOverviewSection teamId={34} />);

    expect(screen.getByTestId('team-profile-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('team-profile-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('team-stage-summary')).not.toBeInTheDocument();
  });

  it('renders an error state when the profile request fails without retry', () => {
    mockTeamProfile({
      error: new Error('Failed to load team profile.'),
      canRetry: false,
    });

    render(<TeamOverviewSection teamId={34} />);

    expect(screen.getByRole('heading', { name: 'Profile Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Failed to load team profile.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('renders a retry action when the profile error can be retried', async () => {
    mockTeamProfile({
      error: new Error('Failed to load team profile.'),
      canRetry: true,
    });

    render(<TeamOverviewSection teamId={34} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith(false);
  });

  it('passes true to profile refetch when the tournament context has an error', async () => {
    mockTournament({ error: new Error('Tournament failed.') });
    mockTeamProfile({
      error: new Error('Failed to load team profile.'),
      canRetry: true,
    });

    render(<TeamOverviewSection teamId={34} />);

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith(true);
  });

  it('renders not found when the profile data is null', () => {
    mockTeamProfile({ teamProfile: null });

    render(<TeamOverviewSection teamId={34} />);

    expect(screen.getByRole('heading', { name: 'Profile Unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Team profile not found.')).toBeInTheDocument();
    expect(screen.queryByTestId('team-profile-header')).not.toBeInTheDocument();
  });

  it('renders the profile header and stage summary when standing data exists', () => {
    render(<TeamOverviewSection teamId={34} />);

    expect(screen.getByTestId('team-profile-header')).toHaveTextContent('Canada');
    expect(screen.getByTestId('team-stage-summary')).toHaveTextContent('Points: 6');
    expect(screen.queryByText('No group stage summary yet')).not.toBeInTheDocument();
  });

  it('renders the profile header and empty summary state when standing data is missing', () => {
    mockTeamProfile({
      teamProfile: {
        ...validTeamProfile,
        standing: null,
      },
    });

    render(<TeamOverviewSection teamId={34} />);

    expect(screen.getByTestId('team-profile-header')).toHaveTextContent('Canada');
    expect(screen.queryByTestId('team-stage-summary')).not.toBeInTheDocument();
    expect(screen.getByText('No group stage summary yet')).toBeInTheDocument();
    expect(
      screen.getByText('This team does not have standings data for the selected tournament.'),
    ).toBeInTheDocument();
  });
});
