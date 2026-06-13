import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TournamentTeam } from '@/types/tournamentTeam';

import TeamCardGrid from './TeamCardGrid';

vi.mock('./TeamCard', () => ({
  default: ({ tournamentTeam }: { tournamentTeam: TournamentTeam }) => (
    <div data-testid="team-card">{tournamentTeam.team.name}</div>
  ),
}));

function createTournamentTeam(id: number, name: string): TournamentTeam {
  return {
    team: {
      id,
      name,
      short_name: name.slice(0, 3).toUpperCase(),
      logo_url: null,
    },
    group: 'A',
    final_rank: null,
    stage_reached: null,
  };
}

describe('TeamCardGrid', () => {
  it('renders one card for each team', () => {
    render(
      <TeamCardGrid
        teams={[
          createTournamentTeam(1, 'Argentina'),
          createTournamentTeam(2, 'Brazil'),
          createTournamentTeam(3, 'Canada'),
        ]}
      />,
    );

    expect(screen.getAllByTestId('team-card')).toHaveLength(3);

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('Canada')).toBeInTheDocument();
  });

  it('renders no cards when teams list is empty', () => {
    render(<TeamCardGrid teams={[]} />);

    expect(screen.queryAllByTestId('team-card')).toHaveLength(0);
  });

  it('applies responsive grid layout classes', () => {
    const { container } = render(<TeamCardGrid teams={[createTournamentTeam(1, 'Argentina')]} />);

    const grid = container.querySelector('.grid');

    expect(grid).toHaveClass('grid-cols-1', 'gap-4', 'min-[900px]:grid-cols-2');
  });

  it('applies page spacing classes', () => {
    const { container } = render(<TeamCardGrid teams={[]} />);

    const wrapper = container.firstChild;

    expect(wrapper).toHaveClass('min-h-screen', 'p-6');
  });
});
