import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import StandingsSkeleton from './StandingsSkeleton';

describe('StandingsSkeleton', () => {
  it('renders the standings skeleton wrapper', () => {
    render(<StandingsSkeleton />);

    expect(screen.getByTestId('standings-skeleton')).toBeInTheDocument();
  });

  it('renders the legend skeleton', () => {
    render(<StandingsSkeleton />);

    expect(screen.getByTestId('legend-skeleton')).toBeInTheDocument();
  });

  it('renders four card skeletons', () => {
    render(<StandingsSkeleton />);

    expect(screen.getAllByTestId('standings-card-skeleton')).toHaveLength(4);
  });

  it('renders four row skeletons per card', () => {
    render(<StandingsSkeleton />);

    expect(screen.getAllByTestId('standings-row-skeleton')).toHaveLength(16);
  });

  it('renders the expected skeleton card structure', () => {
    render(<StandingsSkeleton />);

    const cards = screen.getAllByTestId('standings-card-skeleton');

    for (const card of cards) {
      expect(card).toHaveClass('w-full', 'shadow-sm');
    }
  });

  it('renders the expected row skeleton structure', () => {
    render(<StandingsSkeleton />);

    const rows = screen.getAllByTestId('standings-row-skeleton');

    for (const row of rows) {
      expect(row).toHaveClass(
        'grid',
        'grid-cols-[2rem_minmax(0,1fr)_repeat(4,2rem)]',
        'items-center',
        'gap-2',
      );
    }
  });

  it('renders four cards with four rows each', () => {
    render(<StandingsSkeleton />);

    const cards = screen.getAllByTestId('standings-card-skeleton');

    for (const card of cards) {
      const rows = within(card).getAllByTestId('standings-row-skeleton');
      expect(rows).toHaveLength(4);
    }
  });
});
