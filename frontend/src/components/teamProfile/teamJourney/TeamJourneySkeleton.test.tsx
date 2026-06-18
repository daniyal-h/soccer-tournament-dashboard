import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TeamJourneySkeleton from './TeamJourneySkeleton';

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('TeamJourneySkeleton', () => {
  it('renders the journey header skeletons', () => {
    render(<TeamJourneySkeleton />);

    expect(screen.getByText('Tournament Journey')).toBeInTheDocument();
    expect(screen.getByText('Loading recent form and all matches...')).toBeInTheDocument();

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[0]).toHaveClass('h-5', 'w-36');
  });

  it('renders five recent form placeholders', () => {
    render(<TeamJourneySkeleton />);

    const formBadges = screen
      .getAllByTestId('skeleton')
      .filter((element) => element.className.includes('rounded-full'));

    expect(formBadges).toHaveLength(5);

    for (const badge of formBadges) {
      expect(badge).toHaveClass('h-10', 'w-10', 'rounded-full');
    }
  });

  it('renders form label placeholders for each form result', () => {
    render(<TeamJourneySkeleton />);

    const labels = screen
      .getAllByTestId('skeleton')
      .filter((element) => element.className.includes('h-4 w-10'));

    expect(labels).toHaveLength(5);
  });

  it('renders three closed stage accordion placeholders with varying widths', () => {
    render(<TeamJourneySkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons.some((element) => element.className.includes('w-24'))).toBe(true);

    expect(skeletons.some((element) => element.className.includes('w-36'))).toBe(true);

    expect(skeletons.some((element) => element.className.includes('w-28'))).toBe(true);
  });

  it('renders accordion chevron placeholders for each stage', () => {
    render(<TeamJourneySkeleton />);

    const chevrons = screen
      .getAllByTestId('skeleton')
      .filter((element) => element.className.includes('h-4 w-4'));

    expect(chevrons).toHaveLength(3);
  });
});
