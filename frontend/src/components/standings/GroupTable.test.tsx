import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Standing } from '@/types/standing';

import { GroupTable } from './GroupTable';

const rows: Standing[] = [
  {
    team: {
      id: 1,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: 'https://flagcdn.com/w40/ar.png',
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
  {
    team: {
      id: 2,
      name: 'Brazil',
      short_name: 'BRA',
      logo_url: 'https://flagcdn.com/w40/br.png',
    },
    position: 2,
    matches_played: 3,
    wins: 2,
    draws: 0,
    losses: 1,
    goals_for: 5,
    goals_against: 3,
    goal_difference: 2,
    points: 6,
  },
  {
    team: {
      id: 3,
      name: 'Canada',
      short_name: 'CAN',
      logo_url: 'https://flagcdn.com/w40/ca.png',
    },
    position: 3,
    matches_played: 3,
    wins: 1,
    draws: 0,
    losses: 2,
    goals_for: 4,
    goals_against: 5,
    goal_difference: -1,
    points: 3,
  },
];

describe('GroupTable', () => {
  it('renders all table headers', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Team' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'MP' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'W' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'D' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'L' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'GF' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'GA' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'GD' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Pts' })).toBeInTheDocument();
  });

  it('renders team names, short names, and logos', () => {
    render(<GroupTable rows={rows} />);

    for (const row of rows) {
      expect(screen.getByText(row.team.name)).toBeInTheDocument();
      expect(screen.getByText(row.team.short_name)).toBeInTheDocument();

      const logo = screen.getByAltText(row.team.name);
      expect(logo).toHaveAttribute('src', row.team.logo_url);
    }
  });

  it('renders each team row with its position and stats', () => {
    render(<GroupTable rows={rows} />);

    const argentinaRow = screen.getByText('Argentina').closest('tr');
    expect(argentinaRow).not.toBeNull();

    const cells = within(argentinaRow!).getAllByRole('cell');

    expect(cells[0]).toHaveTextContent('1'); // position
    expect(cells[2]).toHaveTextContent('3'); // MP
    expect(cells[3]).toHaveTextContent('3'); // W
    expect(cells[4]).toHaveTextContent('0'); // D
    expect(cells[5]).toHaveTextContent('0'); // L
    expect(cells[6]).toHaveTextContent('8'); // GF
    expect(cells[7]).toHaveTextContent('2'); // GA
    expect(cells[8]).toHaveTextContent('6'); // GD
    expect(cells[9]).toHaveTextContent('9'); // Pts
  });

  it('only renders points cells in bold', () => {
    render(<GroupTable rows={rows} />);

    const argentinaRow = screen.getByText('Argentina').closest('tr');
    expect(argentinaRow).not.toBeNull();

    const cells = within(argentinaRow!).getAllByRole('cell');

    expect(cells[2]).not.toHaveClass('font-bold'); // MP
    expect(cells[3]).not.toHaveClass('font-bold'); // W
    expect(cells[9]).toHaveClass('font-bold'); // Pts
  });

  it('renders a dash instead of zero position for pre-tournament rows', () => {
    const zeroStateRows = rows.map((row) => ({ ...row, position: 0 }));

    render(<GroupTable rows={zeroStateRows} />);

    expect(screen.getAllByText('-')).toHaveLength(3);
  });

  it('highlights positions one and two', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByText('Argentina').closest('tr')).toHaveClass('bg-accent');
    expect(screen.getByText('Brazil').closest('tr')).toHaveClass('bg-accent');
  });

  it('does not highlight teams outside the top two', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByText('Canada').closest('tr')).not.toHaveClass('bg-accent');
  });

  it('does not highlight pre-tournament rows with position zero', () => {
    const zeroStateRows = rows.map((row) => ({ ...row, position: 0 }));

    render(<GroupTable rows={zeroStateRows} />);

    for (const row of zeroStateRows) {
      expect(screen.getByText(row.team.name).closest('tr')).not.toHaveClass('bg-accent');
    }
  });

  it('renders an empty body when there are no rows', () => {
    render(<GroupTable rows={[]} />);

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.queryByText('Argentina')).not.toBeInTheDocument();
  });

  it('does not apply highlight styling to teams outside the top two', () => {
    render(<GroupTable rows={rows} />);

    const canadaRow = screen.getByText('Canada').closest('tr');

    expect(canadaRow).not.toHaveClass('bg-accent');
    expect(canadaRow).not.toHaveClass('Stryker was here!');
  });

  it('hides mobile-hidden columns on small screens', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByRole('columnheader', { name: 'MP' })).toHaveClass(
      'hidden',
      'min-[450px]:table-cell',
    );
  });

  it('renders points cells in bold', () => {
    render(<GroupTable rows={rows} />);

    const argentinaRow = screen.getByText('Argentina').closest('tr');
    const cells = within(argentinaRow!).getAllByRole('cell');

    expect(cells[9]).toHaveClass('font-bold');
  });
});
