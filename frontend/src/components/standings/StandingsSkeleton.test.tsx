import { render, screen } from '@testing-library/react';
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
});
