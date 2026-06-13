import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TournamentTeam } from '@/types/tournamentTeam';

import Teams from './Teams';

vi.mock('@/context/TournamentContext', () => ({
  useTournament: vi.fn(),
}));

vi.mock('@/hooks/useTournamentTeams', () => ({
  useTournamentTeams: vi.fn(),
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
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      {onAction && <button onClick={onAction}>Retry</button>}
    </div>
  ),
}));

vi.mock('@/components/tournamentTeams/TeamsSkeleton', () => ({
  default: () => <div data-testid="teams-skeleton" />,
}));

vi.mock('@/components/tournamentTeams/TeamFilters', () => ({
  default: ({
    groups,
    stages,
    selectedGroup,
    selectedStage,
    onGroupChange,
    onStageChange,
  }: {
    groups: string[];
    stages: string[];
    selectedGroup: string;
    selectedStage: string;
    onGroupChange: (group: string) => void;
    onStageChange: (stage: string) => void;
  }) => (
    <div data-testid="team-filters">
      <span>selected-group:{selectedGroup}</span>
      <span>selected-stage:{selectedStage}</span>

      <div data-testid="groups">{groups.join(',')}</div>
      <div data-testid="stages">{stages.join(',')}</div>

      <button onClick={() => onGroupChange('A')}>Filter Group A</button>
      <button onClick={() => onStageChange('semi_final')}>Filter Semi Final</button>
    </div>
  ),
}));

vi.mock('@/components/tournamentTeams/TeamCardGrid', () => ({
  default: ({ teams }: { teams: TournamentTeam[] }) => (
    <div data-testid="team-card-grid">
      {teams.map((tournamentTeam) => (
        <div key={tournamentTeam.team.id}>{tournamentTeam.team.name}</div>
      ))}
    </div>
  ),
}));

import { useTournament } from '@/context/TournamentContext';

import { useTournamentTeams } from '@/hooks/useTournamentTeams';

const mockUseTournament = vi.mocked(useTournament);
const mockUseTournamentTeams = vi.mocked(useTournamentTeams);

function createTournamentTeam(overrides: Partial<TournamentTeam> = {}): TournamentTeam {
  return {
    team: {
      id: 1,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: null,
    },
    group: 'A',
    final_rank: null,
    stage_reached: null,
    ...overrides,
  };
}

function setTournamentContext({
  selectedTournamentId = 1,
  error = null,
}: {
  selectedTournamentId?: number;
  error?: Error | null;
} = {}) {
  mockUseTournament.mockReturnValue({
    selectedTournamentId,
    error,
  } as never);
}

function setTournamentTeamsHook({
  tournamentTeams = [],
  isLoading = false,
  error = null,
  refetch = vi.fn(),
  canRetry = true,
}: {
  tournamentTeams?: TournamentTeam[];
  isLoading?: boolean;
  error?: Error | null;
  refetch?: ReturnType<typeof vi.fn>;
  canRetry?: boolean;
} = {}) {
  mockUseTournamentTeams.mockReturnValue({
    tournamentTeams,
    isLoading,
    error,
    refetch,
    canRetry,
  } as never);

  return { refetch };
}

describe('Teams', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setTournamentContext();
    setTournamentTeamsHook();
  });

  it('fetches tournament teams for the selected tournament', () => {
    setTournamentContext({ selectedTournamentId: 42 });

    render(<Teams />);

    expect(mockUseTournamentTeams).toHaveBeenCalledWith({
      tournament_id: 42,
    });
  });

  it('renders loading title, loading description, and skeleton', () => {
    setTournamentTeamsHook({ isLoading: true });

    render(<Teams />);

    expect(screen.getByRole('heading', { name: 'Teams' })).toBeInTheDocument();
    expect(screen.getByText('Loading teams and rankings...')).toBeInTheDocument();
    expect(screen.getByTestId('teams-skeleton')).toBeInTheDocument();
    expect(screen.queryByTestId('team-filters')).not.toBeInTheDocument();
    expect(screen.queryByTestId('team-card-grid')).not.toBeInTheDocument();
  });

  it('renders error state when teams fail to load', () => {
    setTournamentTeamsHook({
      error: new Error('Failed to load teams.'),
    });

    render(<Teams />);

    expect(screen.getByText('Teams Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load teams.')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Teams' })).not.toBeInTheDocument();
  });

  it('calls refetch with tournament error flag when retry is clicked', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    setTournamentContext({
      error: new Error('Tournament failed.'),
    });
    setTournamentTeamsHook({
      error: new Error('Failed to load teams.'),
      refetch,
      canRetry: true,
    });

    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(refetch).toHaveBeenCalledOnce();
    expect(refetch).toHaveBeenCalledWith(true);
  });

  it('does not show retry action when retry is not allowed', () => {
    setTournamentTeamsHook({
      error: new Error('Failed to load teams.'),
      canRetry: false,
    });

    render(<Teams />);

    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
  });

  it('renders teams description and passes groups and stages to filters', () => {
    setTournamentTeamsHook({
      tournamentTeams: [
        createTournamentTeam({
          team: { id: 1, name: 'Argentina', short_name: 'ARG', logo_url: null },
          group: 'A',
          stage_reached: 'semi_final',
        }),
        createTournamentTeam({
          team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: null },
          group: 'B',
          stage_reached: 'final',
        }),
      ],
    });

    render(<Teams />);

    expect(
      screen.getByText('Explore all 2 teams, groups, and tournament progress.'),
    ).toBeInTheDocument();

    expect(screen.getByTestId('groups')).toHaveTextContent('A,B');
    expect(screen.getByTestId('stages')).toHaveTextContent('final,semi_final');
  });

  it('renders all teams by default', () => {
    setTournamentTeamsHook({
      tournamentTeams: [
        createTournamentTeam({
          team: { id: 1, name: 'Argentina', short_name: 'ARG', logo_url: null },
          group: 'A',
        }),
        createTournamentTeam({
          team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: null },
          group: 'B',
        }),
      ],
    });

    render(<Teams />);

    const grid = screen.getByTestId('team-card-grid');

    expect(within(grid).getByText('Argentina')).toBeInTheDocument();
    expect(within(grid).getByText('Brazil')).toBeInTheDocument();
  });

  it('filters teams by selected group', async () => {
    const user = userEvent.setup();

    setTournamentTeamsHook({
      tournamentTeams: [
        createTournamentTeam({
          team: { id: 1, name: 'Argentina', short_name: 'ARG', logo_url: null },
          group: 'A',
        }),
        createTournamentTeam({
          team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: null },
          group: 'B',
        }),
      ],
    });

    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'Filter Group A' }));

    const grid = screen.getByTestId('team-card-grid');

    expect(within(grid).getByText('Argentina')).toBeInTheDocument();
    expect(within(grid).queryByText('Brazil')).not.toBeInTheDocument();
    expect(screen.getByText('selected-group:A')).toBeInTheDocument();
  });

  it('filters teams by selected stage', async () => {
    const user = userEvent.setup();

    setTournamentTeamsHook({
      tournamentTeams: [
        createTournamentTeam({
          team: { id: 1, name: 'Argentina', short_name: 'ARG', logo_url: null },
          stage_reached: 'semi_final',
        }),
        createTournamentTeam({
          team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: null },
          stage_reached: 'final',
        }),
      ],
    });

    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'Filter Semi Final' }));

    const grid = screen.getByTestId('team-card-grid');

    expect(within(grid).getByText('Argentina')).toBeInTheDocument();
    expect(within(grid).queryByText('Brazil')).not.toBeInTheDocument();
    expect(screen.getByText('selected-stage:semi_final')).toBeInTheDocument();
  });

  it('combines group and stage filters', async () => {
    const user = userEvent.setup();

    setTournamentTeamsHook({
      tournamentTeams: [
        createTournamentTeam({
          team: { id: 1, name: 'Argentina', short_name: 'ARG', logo_url: null },
          group: 'A',
          stage_reached: 'semi_final',
        }),
        createTournamentTeam({
          team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: null },
          group: 'A',
          stage_reached: 'final',
        }),
        createTournamentTeam({
          team: { id: 3, name: 'Canada', short_name: 'CAN', logo_url: null },
          group: 'B',
          stage_reached: 'semi_final',
        }),
      ],
    });

    render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'Filter Group A' }));
    await user.click(screen.getByRole('button', { name: 'Filter Semi Final' }));

    const grid = screen.getByTestId('team-card-grid');

    expect(within(grid).getByText('Argentina')).toBeInTheDocument();
    expect(within(grid).queryByText('Brazil')).not.toBeInTheDocument();
    expect(within(grid).queryByText('Canada')).not.toBeInTheDocument();
  });

  it('resets filters to all when selected tournament changes', async () => {
    const user = userEvent.setup();

    setTournamentContext({ selectedTournamentId: 1 });
    setTournamentTeamsHook({
      tournamentTeams: [
        createTournamentTeam({
          team: { id: 1, name: 'Argentina', short_name: 'ARG', logo_url: null },
          group: 'A',
        }),
        createTournamentTeam({
          team: { id: 2, name: 'Brazil', short_name: 'BRA', logo_url: null },
          group: 'B',
        }),
      ],
    });

    const { rerender } = render(<Teams />);

    await user.click(screen.getByRole('button', { name: 'Filter Group A' }));

    expect(screen.getByText('selected-group:A')).toBeInTheDocument();

    setTournamentContext({ selectedTournamentId: 2 });
    rerender(<Teams />);

    expect(screen.getByText('selected-group:all')).toBeInTheDocument();

    const grid = screen.getByTestId('team-card-grid');

    expect(within(grid).getByText('Argentina')).toBeInTheDocument();
    expect(within(grid).getByText('Brazil')).toBeInTheDocument();
  });
});
