import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TeamsSkeleton from './TeamsSkeleton';

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('TeamsSkeleton', () => {
  it('renders two filter skeletons', () => {
    render(<TeamsSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons.filter((skeleton) => skeleton.className.includes('sm:w-48'))).toHaveLength(2);
  });

  it('renders six team card skeletons', () => {
    const { container } = render(<TeamsSkeleton />);

    const cards = container.querySelectorAll('.bg-card');

    expect(cards).toHaveLength(6);
  });

  it('renders four skeleton elements per team card', () => {
    render(<TeamsSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    // 2 filters + (6 cards * 4 skeletons each)
    expect(skeletons).toHaveLength(26);
  });

  it('applies responsive filter layout classes', () => {
    const { container } = render(<TeamsSkeleton />);

    const filterWrapper = container.firstChild?.firstChild;

    expect(filterWrapper).toHaveClass('h-8', 'w-full', 'sm:w-48');
  });

  it('applies responsive card grid classes', () => {
    const { container } = render(<TeamsSkeleton />);

    const grid = container.querySelector('.grid');

    expect(grid).toHaveClass('grid-cols-1', 'gap-4', 'min-[900px]:grid-cols-2');
  });

  it('matches team card dimensions and styling', () => {
    const { container } = render(<TeamsSkeleton />);

    const card = container.querySelector('.bg-card');

    expect(card).toHaveClass(
      'relative',
      'h-23',
      'overflow-hidden',
      'rounded-xl',
      'border',
      'bg-card',
      'p-4',
      'shadow-sm',
    );
  });

  it('renders background logo placeholder skeletons', () => {
    render(<TeamsSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    const backgroundPlaceholders = skeletons.filter((skeleton) =>
      skeleton.className.includes('-right-3'),
    );

    expect(backgroundPlaceholders).toHaveLength(6);
  });
});
