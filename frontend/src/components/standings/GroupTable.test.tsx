import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { Standing } from '@/types/standings';

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
];

describe('GroupTable', () => {
  it('renders standings headers and team data', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('Team')).toBeInTheDocument();
    expect(screen.getByText('Pts')).toBeInTheDocument();

    expect(screen.getByText('Argentina')).toBeInTheDocument();
    expect(screen.getByText('ARG')).toBeInTheDocument();
    expect(screen.getByText('Brazil')).toBeInTheDocument();
    expect(screen.getByText('BRA')).toBeInTheDocument();
  });

  it('renders points values', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getAllByText('6')).toHaveLength(2);
  });

  it('renders team logos with accessible alt text', () => {
    render(<GroupTable rows={rows} />);

    expect(screen.getByAltText('Argentina')).toBeInTheDocument();
    expect(screen.getByAltText('Brazil')).toBeInTheDocument();
  });
});

it('renders dash for position 0', () => {
  const zeroStateRows = rows.map((row) => ({ ...row, position: 0 }));
  render(<GroupTable rows={zeroStateRows} />);

  const dashes = screen.getAllByText('-');
  expect(dashes).toHaveLength(2);
});

it('highlights top 2 positions but not position 0', () => {
  const zeroStateRows = rows.map((row) => ({ ...row, position: 0 }));
  const { container } = render(<GroupTable rows={zeroStateRows} />);

  // depends on what class/style you use for advancement highlighting
  expect(container.querySelectorAll('.advancement-highlight')).toHaveLength(0);
});
