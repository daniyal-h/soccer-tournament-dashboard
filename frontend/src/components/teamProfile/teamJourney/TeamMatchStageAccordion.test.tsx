import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Accordion } from '@/components/ui/accordion';

import type { Match } from '@/types/match';

import { ROUTES } from '@/constants/navigation';

import TeamMatchStageAccordion from './TeamMatchStageAccordion';

vi.mock('@/components/matches/MatchCard', () => ({
  default: ({ match, variant, from }: { match: Match; variant?: string; from?: string }) => (
    <div data-testid="match-card" data-match-id={match.id} data-variant={variant} data-from={from}>
      {match.team_a.name} vs {match.team_b.name}
    </div>
  ),
}));

const canada = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: null,
};

const brazil = {
  id: 2,
  name: 'Brazil',
  short_name: 'BRA',
  logo_url: null,
};

function makeMatch(id: number): Match {
  return {
    id,
    team_a: canada,
    team_b: brazil,
    kickoff_time: '2026-06-12T20:00:00Z',
    stage: 'group',
    group: 'A',
    status: 'finished',
    venue: 'BC Place',
    city: 'Vancouver',
    elapsed: 90,
    team_a_score: 2,
    team_b_score: 1,
    team_a_penalties: null,
    team_b_penalties: null,
  };
}

function renderAccordion(matches = [makeMatch(1)]) {
  return render(
    <Accordion type="multiple" defaultValue={['group']}>
      <TeamMatchStageAccordion
        group={{
          stage: 'group',
          label: 'Group Stage',
          matches,
        }}
      />
    </Accordion>,
  );
}

describe('TeamMatchStageAccordion', () => {
  it('renders the stage label as the accordion trigger', () => {
    renderAccordion();

    expect(screen.getByRole('button', { name: 'Group Stage' })).toBeInTheDocument();
  });

  it('renders all matches in the stage group', () => {
    renderAccordion([makeMatch(1), makeMatch(2), makeMatch(3)]);

    const cards = screen.getAllByTestId('match-card');

    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAttribute('data-match-id', '1');
    expect(cards[1]).toHaveAttribute('data-match-id', '2');
    expect(cards[2]).toHaveAttribute('data-match-id', '3');
  });

  it('passes nested variant and teams route source to match cards', () => {
    renderAccordion();

    const card = screen.getByTestId('match-card');

    expect(card).toHaveAttribute('data-variant', 'nested');
    expect(card).toHaveAttribute('data-from', ROUTES.TEAMS);
  });

  it('renders an empty accordion content when there are no matches', () => {
    renderAccordion([]);

    expect(screen.getByRole('button', { name: 'Group Stage' })).toBeInTheDocument();

    expect(screen.queryByTestId('match-card')).not.toBeInTheDocument();
  });
});
