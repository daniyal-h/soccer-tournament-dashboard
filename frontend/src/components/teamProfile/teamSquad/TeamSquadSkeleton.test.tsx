import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import TeamSquadSkeleton from './TeamSquadSkeleton';

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <div data-testid="separator" />,
}));

describe('TeamSquadSkeleton', () => {
  it('renders the squad loading card header', () => {
    render(<TeamSquadSkeleton />);

    expect(screen.getByText('Team Squad')).toBeInTheDocument();

    expect(screen.getByText('Loading roster and squad details...')).toBeInTheDocument();
  });

  it('renders a placeholder row for each squad position group', () => {
    render(<TeamSquadSkeleton />);

    // 4 position labels + 4 chevrons
    expect(screen.getAllByTestId('skeleton')).toHaveLength(8);

    // separator after each position row
    expect(screen.getAllByTestId('separator')).toHaveLength(4);
  });

  it('renders varied label skeleton widths for a more natural loading state', () => {
    render(<TeamSquadSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[0]).toHaveClass('w-28');
    expect(skeletons[2]).toHaveClass('w-20');
    expect(skeletons[4]).toHaveClass('w-24');
    expect(skeletons[6]).toHaveClass('w-18');
  });

  it('renders square placeholders for accordion icons', () => {
    render(<TeamSquadSkeleton />);

    const skeletons = screen.getAllByTestId('skeleton');

    expect(skeletons[1]).toHaveClass('size-4');
    expect(skeletons[3]).toHaveClass('size-4');
    expect(skeletons[5]).toHaveClass('size-4');
    expect(skeletons[7]).toHaveClass('size-4');
  });
});
