import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useTournament } from '@/context/TournamentContext';

import { useTeamSquad } from '@/hooks/useTeamSquad';

import TeamSquadSection from './TeamSquadSection';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/hooks/useTeamSquad', () => ({
  useTeamSquad: vi.fn(),
}));

vi.mock('./teamSquad/TeamSquadSkeleton', () => ({
  default: () => <div data-testid="team-squad-skeleton">Loading squad</div>,
}));

vi.mock('./teamSquad/PositionSquadAccordion', () => ({
  default: ({ group }: { group: { position: string; squad: unknown[] } }) => (
    <div data-testid="position-squad-accordion">
      {group.position}:{group.squad.length}
    </div>
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
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  ),
}));

const mockedUseTournament = vi.mocked(useTournament);
const mockedUseTeamSquad = vi.mocked(useTeamSquad);

const refetch = vi.fn();

const groupedSquad = [
  {
    position: 'GK',
    squad: [
      {
        player: {
          id: 1,
          display_name: 'D. St. Clair',
          first_name: 'Dayne',
          last_name: 'St. Clair',
          photo_url: null,
          nationality: 'Canada',
          date_of_birth: '1997-05-09',
          height: 191,
        },
        squad_number: 1,
        position: 'GK',
      },
    ],
  },
  {
    position: 'DEF',
    squad: [
      {
        player: {
          id: 2,
          display_name: 'A. Davies',
          first_name: 'Alphonso',
          last_name: 'Davies',
          photo_url: null,
          nationality: 'Canada',
          date_of_birth: '2000-11-02',
          height: 183,
        },
        squad_number: 19,
        position: 'DEF',
      },
    ],
  },
];

function mockTournament(overrides = {}) {
  mockedUseTournament.mockReturnValue({
    selectedTournamentId: 10,
    error: null,
    ...overrides,
  } as never);
}

function mockTeamSquad(overrides = {}) {
  mockedUseTeamSquad.mockReturnValue({
    groupedSquad,
    isLoading: false,
    error: null,
    emptyState: null,
    refetch,
    canRetry: true,
    ...overrides,
  } as never);
}

describe('TeamSquadSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTournament();
    mockTeamSquad();
  });

  it('loads squad using the selected tournament id and team id', () => {
    render(<TeamSquadSection teamId={32} />);

    expect(mockedUseTeamSquad).toHaveBeenCalledTimes(1);
    expect(mockedUseTeamSquad).toHaveBeenCalledWith({
      tournament_id: 10,
      team_id: 32,
    });
  });

  it('renders the loading skeleton while squad is loading', () => {
    mockTeamSquad({
      isLoading: true,
    });

    render(<TeamSquadSection teamId={32} />);

    expect(screen.getByTestId('team-squad-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Team Squad')).not.toBeInTheDocument();
  });

  it('renders an error state when squad loading fails', () => {
    mockTeamSquad({
      error: new Error('Failed to load team squad.'),
    });

    render(<TeamSquadSection teamId={32} />);

    expect(screen.getByText('Squad Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load team squad.')).toBeInTheDocument();
    expect(screen.queryByText('Team Squad')).not.toBeInTheDocument();
  });

  it('does not render retry action when the error cannot be retried', () => {
    mockTeamSquad({
      error: new Error('Failed to load team squad.'),
      canRetry: false,
    });

    render(<TeamSquadSection teamId={32} />);

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('calls refetch with tournament error state when retry is clicked', async () => {
    mockTournament({
      error: new Error('Tournament failed'),
    });
    mockTeamSquad({
      error: new Error('Failed to load team squad.'),
      canRetry: true,
    });

    render(<TeamSquadSection teamId={32} />);

    screen.getByRole('button', { name: /retry/i }).click();

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith(true);
  });

  it('calls refetch with false when there is no tournament error', () => {
    mockTeamSquad({
      error: new Error('Failed to load team squad.'),
      canRetry: true,
    });

    render(<TeamSquadSection teamId={32} />);

    screen.getByRole('button', { name: /retry/i }).click();

    expect(refetch).toHaveBeenCalledTimes(1);
    expect(refetch).toHaveBeenCalledWith(false);
  });

  it('renders empty state when the squad is empty', () => {
    mockTeamSquad({
      emptyState: 'This team squad will appear once player data is available.',
    });

    render(<TeamSquadSection teamId={32} />);

    expect(screen.getByText('Squad Unavailable')).toBeInTheDocument();
    expect(
      screen.getByText('This team squad will appear once player data is available.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Team Squad')).not.toBeInTheDocument();
  });

  it('renders the squad card title, description, and position accordions', () => {
    render(<TeamSquadSection teamId={32} />);

    expect(screen.getByText('Team Squad')).toBeInTheDocument();
    expect(
      screen.getByText('Player roster and squad details for this competition'),
    ).toBeInTheDocument();

    const accordions = screen.getAllByTestId('position-squad-accordion');

    expect(accordions).toHaveLength(2);
    expect(screen.getByText('GK:1')).toBeInTheDocument();
    expect(screen.getByText('DEF:1')).toBeInTheDocument();
  });
});
