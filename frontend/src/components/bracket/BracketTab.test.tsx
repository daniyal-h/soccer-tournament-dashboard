import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { BracketRound } from '@/types/bracket';
import type { Match } from '@/types/match';

import { COMPACT_STAGE_LABELS } from '@/constants/brackets';

import BracketTabs from './BracketTab';

vi.mock('@/components/matches/MatchCard', () => ({
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

function makeRound(overrides: Partial<BracketRound> = {}): BracketRound {
  return {
    stage: 'final',
    title: 'Final',
    matches: [],
    ...overrides,
  };
}

describe('BracketTabs', () => {
  it('renders compact stage labels as tab triggers', () => {
    render(
      <BracketTabs
        rounds={[
          makeRound({ stage: 'round_of_16' }),
          makeRound({ stage: 'quarter_final' }),
          makeRound({ stage: 'semi_final' }),
        ]}
      />,
    );

    expect(
      screen.getByRole('tab', {
        name: COMPACT_STAGE_LABELS.round_of_16,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('tab', {
        name: COMPACT_STAGE_LABELS.quarter_final,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('tab', {
        name: COMPACT_STAGE_LABELS.semi_final,
      }),
    ).toBeInTheDocument();
  });

  it('selects the first round by default', () => {
    render(
      <BracketTabs
        rounds={[
          makeRound({
            stage: 'semi_final',
            matches: [makeMatch(1)],
          }),
          makeRound({
            stage: 'final',
            matches: [makeMatch(2)],
          }),
        ]}
      />,
    );

    expect(screen.getByRole('tab', { name: COMPACT_STAGE_LABELS.semi_final })).toHaveAttribute(
      'data-state',
      'active',
    );

    expect(screen.getByText('Match 1')).toBeInTheDocument();
  });

  it('changes displayed matches when selecting another round', async () => {
    const user = userEvent.setup();

    render(
      <BracketTabs
        rounds={[
          makeRound({
            stage: 'semi_final',
            matches: [makeMatch(1)],
          }),
          makeRound({
            stage: 'final',
            matches: [makeMatch(2)],
          }),
        ]}
      />,
    );

    await user.click(
      screen.getByRole('tab', {
        name: COMPACT_STAGE_LABELS.final,
      }),
    );

    expect(screen.getByText('Match 2')).toBeInTheDocument();
  });

  it('renders every match in the selected round', () => {
    render(
      <BracketTabs
        rounds={[
          makeRound({
            matches: [makeMatch(1), makeMatch(2), makeMatch(3)],
          }),
        ]}
      />,
    );

    expect(screen.getAllByTestId('match-card')).toHaveLength(3);

    expect(screen.getByText('Match 1')).toBeInTheDocument();
    expect(screen.getByText('Match 2')).toBeInTheDocument();
    expect(screen.getByText('Match 3')).toBeInTheDocument();
  });

  it('renders nothing when no rounds exist', () => {
    const { container } = render(<BracketTabs rounds={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('sets the grid columns based on the number of rounds', () => {
    render(
      <BracketTabs
        rounds={[
          makeRound({ stage: 'round_of_16' }),
          makeRound({ stage: 'quarter_final' }),
          makeRound({ stage: 'semi_final' }),
        ]}
      />,
    );

    const tabsList = screen.getByRole('tablist');

    expect(tabsList).toHaveStyle({
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    });
  });
});
