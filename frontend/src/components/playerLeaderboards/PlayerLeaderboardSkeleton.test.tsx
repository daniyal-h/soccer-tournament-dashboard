import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import PlayerLeaderboardSkeleton from './PlayerLeaderboardSkeleton';

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('PlayerLeaderboardSkeleton', () => {
  it('renders eight skeleton cards', () => {
    const { container } = render(<PlayerLeaderboardSkeleton />);

    expect(container.querySelectorAll('article')).toHaveLength(8);
  });

  it('renders seven skeleton blocks per card', () => {
    render(<PlayerLeaderboardSkeleton />);

    expect(screen.getAllByTestId('skeleton')).toHaveLength(72);
  });

  it('uses the same responsive grid classes as the leaderboard list', () => {
    const { container } = render(<PlayerLeaderboardSkeleton />);

    const grid = container.firstElementChild;

    expect(grid).toHaveClass('grid');
    expect(grid).toHaveClass('gap-4');
    expect(grid).toHaveClass('min-[900px]:grid-cols-2');
  });

  it('uses the same base card layout classes as leaderboard cards', () => {
    const { container } = render(<PlayerLeaderboardSkeleton />);

    const firstCard = container.querySelector('article');

    expect(firstCard).toHaveClass('flex');
    expect(firstCard).toHaveClass('min-w-0');
    expect(firstCard).toHaveClass('items-center');
    expect(firstCard).toHaveClass('gap-4');
    expect(firstCard).toHaveClass('rounded-xl');
    expect(firstCard).toHaveClass('border');
    expect(firstCard).toHaveClass('bg-card');
    expect(firstCard).toHaveClass('p-4');
    expect(firstCard).toHaveClass('shadow-sm');
  });

  it('renders rank and avatar placeholders as rounded circles', () => {
    render(<PlayerLeaderboardSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[0]).toHaveClass('h-16');
    expect(skeletons[0]).toHaveClass('w-16');
    expect(skeletons[0]).toHaveClass('rounded-full');

    expect(skeletons[1]).toHaveClass('h-16');
    expect(skeletons[1]).toHaveClass('w-16');
    expect(skeletons[1]).toHaveClass('rounded-full');
  });

  it('renders value placeholders on the right side of each card', () => {
    const { container } = render(<PlayerLeaderboardSkeleton />);

    const firstCard = container.querySelector('article');
    const rightColumn = firstCard?.lastElementChild;

    expect(rightColumn).toHaveClass('flex');
    expect(rightColumn).toHaveClass('shrink-0');
    expect(rightColumn).toHaveClass('flex-col');
    expect(rightColumn).toHaveClass('items-end');
    expect(rightColumn).toHaveClass('gap-2');
  });
});
