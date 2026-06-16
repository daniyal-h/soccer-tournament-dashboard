import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TeamProfileSkeleton from './TeamProfileSkeleton';

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('TeamProfileSkeleton', () => {
  it('renders all loading placeholders', () => {
    render(<TeamProfileSkeleton />);

    expect(screen.getAllByTestId('skeleton')).toHaveLength(12);
  });

  it('renders header placeholders', () => {
    render(<TeamProfileSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[0]).toHaveClass('rounded-full');
    expect(skeletons[1]).toHaveClass('w-48');
    expect(skeletons[2]).toHaveClass('w-10');
    expect(skeletons[3]).toHaveClass('rounded-full');
  });

  it('renders stage summary placeholders', () => {
    render(<TeamProfileSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[4]).toHaveClass('w-48');

    expect(skeletons[5]).toHaveClass('h-23');
    expect(skeletons[6]).toHaveClass('h-23');
    expect(skeletons[7]).toHaveClass('h-23');

    expect(skeletons[8]).toHaveClass('h-16');
    expect(skeletons[9]).toHaveClass('h-16');
  });

  it('uses responsive sizing for the logo and title placeholders', () => {
    render(<TeamProfileSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[0]).toHaveClass('sm:h-24');
    expect(skeletons[0]).toHaveClass('sm:w-24');

    expect(skeletons[1]).toHaveClass('sm:h-14');
    expect(skeletons[1]).toHaveClass('sm:w-90');
  });
});
