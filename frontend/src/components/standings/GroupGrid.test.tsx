import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import type { Standing } from '@/types/standing';

import GroupGrid from './GroupGrid';

const groupRows: Standing[] = [
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

describe('GroupGrid', () => {
  it('renders one card per group', () => {
    render(
      <MemoryRouter>
        <GroupGrid
          standings={{
            A: groupRows,
            B: groupRows,
          }}
        />
        ,
      </MemoryRouter>,
    );

    expect(screen.getByText('Group A')).toBeInTheDocument();
    expect(screen.getByText('Group B')).toBeInTheDocument();
  });
});
