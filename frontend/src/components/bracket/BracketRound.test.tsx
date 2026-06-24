import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Match } from '@/types/match';

import BracketRound from './BracketRound';

vi.mock('../matches/MatchCard', () => ({
  default: ({ match }: { match: Match }) => <div data-testid="match-card">Match {match.id}</div>,
}));

function makeMatch(id: number): Match {
  return {
    id,
    team_a: {
      id: 1,
      name: 'France',
      short_name: 'FRA',
      logo_url: null,
    },
    team_b: {
      id: 2,
      name: 'Argentina',
      short_name: 'ARG',
      logo_url: null,
    },
    kickoff_time: '2026-07-19T20:00:00Z',
    stage: 'final',
    group: null,
    status: 'scheduled',
    venue: null,
    city: null,
    elapsed: null,
    team_a_score: null,
    team_b_score: null,
    team_a_penalties: null,
    team_b_penalties: null,
  };
}

describe('BracketRound', () => {
  it('renders the round title', () => {
    render(<BracketRound stage="final" title="Final" matches={[]} />);

    expect(screen.getByRole('heading', { name: 'Final' })).toBeInTheDocument();
  });

  it('renders every match card', () => {
    render(
      <BracketRound
        stage="semi_final"
        title="Semi-Finals"
        matches={[makeMatch(1), makeMatch(2)]}
      />,
    );

    expect(screen.getAllByTestId('match-card')).toHaveLength(2);

    expect(screen.getByText('Match 1')).toBeInTheDocument();
    expect(screen.getByText('Match 2')).toBeInTheDocument();
  });

  it('preserves match ordering', () => {
    render(
      <BracketRound
        stage="round_of_16"
        title="Round of 16"
        matches={[makeMatch(10), makeMatch(20), makeMatch(30)]}
      />,
    );

    const cards = screen.getAllByTestId('match-card');

    expect(cards[0]).toHaveTextContent('Match 10');
    expect(cards[1]).toHaveTextContent('Match 20');
    expect(cards[2]).toHaveTextContent('Match 30');
  });

  it('renders no match cards when the round has no matches', () => {
    render(<BracketRound stage="quarter_final" title="Quarter-Finals" matches={[]} />);

    expect(screen.queryByTestId('match-card')).not.toBeInTheDocument();

    expect(
      screen.getByRole('heading', {
        name: 'Quarter-Finals',
      }),
    ).toBeInTheDocument();
  });
});
