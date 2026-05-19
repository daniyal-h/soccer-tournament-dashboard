import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import GroupCard from './GroupCard';
import type { Standing } from '@/types/standings';

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
];

describe('GroupCard', () => {
  it('renders the group title and standings table', () => {
    render(<GroupCard group="A" rows={rows} />);

    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Argentina')).toBeInTheDocument();
  });
});
