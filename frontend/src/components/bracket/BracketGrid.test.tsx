import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { BracketRound as BracketRoundType } from '@/types/bracket';

import { BracketGrid } from './BracketGrid';

vi.mock('./BracketRound', () => ({
  default: ({ stage, title, matches }: BracketRoundType) => (
    <div data-testid="bracket-round">
      <span>{stage}</span>
      <span>{title}</span>
      <span>{matches.length} matches</span>
    </div>
  ),
}));

function makeRound(overrides: Partial<BracketRoundType> = {}): BracketRoundType {
  return {
    stage: 'final',
    title: 'Final',
    matches: [],
    ...overrides,
  };
}

describe('BracketGrid', () => {
  it('renders each bracket round', () => {
    const rounds = [
      makeRound({
        stage: 'semi_final',
        title: 'Semi-Finals',
      }),
      makeRound({
        stage: 'final',
        title: 'Final',
      }),
    ];

    render(<BracketGrid rounds={rounds} />);

    expect(screen.getAllByTestId('bracket-round')).toHaveLength(2);

    expect(screen.getByText('Semi-Finals')).toBeInTheDocument();
    expect(screen.getByText('Final')).toBeInTheDocument();
  });

  it('passes matches to each round', () => {
    render(
      <BracketGrid
        rounds={[
          makeRound({
            matches: [{ id: 1 }, { id: 2 }] as BracketRoundType['matches'],
          }),
        ]}
      />,
    );

    expect(screen.getByText('2 matches')).toBeInTheDocument();
  });

  it('keeps rounds in tournament order', () => {
    const rounds = [
      makeRound({
        stage: 'quarter_final',
        title: 'Quarter-Finals',
      }),
      makeRound({
        stage: 'semi_final',
        title: 'Semi-Finals',
      }),
      makeRound({
        stage: 'final',
        title: 'Final',
      }),
    ];

    render(<BracketGrid rounds={rounds} />);

    const renderedRounds = screen.getAllByTestId('bracket-round');

    expect(renderedRounds[0]).toHaveTextContent('quarter_final');
    expect(renderedRounds[1]).toHaveTextContent('semi_final');
    expect(renderedRounds[2]).toHaveTextContent('final');
  });

  it('renders no rounds when list is empty', () => {
    render(<BracketGrid rounds={[]} />);

    expect(screen.queryByTestId('bracket-round')).not.toBeInTheDocument();
  });
});
