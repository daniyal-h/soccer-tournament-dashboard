import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { BracketSkeleton } from './BracketSkeleton';

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

describe('BracketSkeleton', () => {
  it('renders mobile tab and match placeholders', () => {
    const { container } = render(<BracketSkeleton />);

    const mobileSection = container.querySelector('.md\\:hidden');

    expect(mobileSection).toBeInTheDocument();

    const skeletons = mobileSection?.querySelectorAll('[data-testid="skeleton"]');

    // 4 tabs + 3 match cards
    expect(skeletons).toHaveLength(7);
  });

  it('renders desktop bracket columns', () => {
    const { container } = render(<BracketSkeleton />);

    const desktopSection = container.querySelector('.md\\:block');

    expect(desktopSection).toBeInTheDocument();

    const columns = desktopSection?.querySelectorAll('.w-\\[26rem\\]');

    expect(columns).toHaveLength(4);
  });

  it('renders more matches in the first desktop column', () => {
    const { container } = render(<BracketSkeleton />);

    const columns = container.querySelectorAll('.w-\\[26rem\\]');

    expect(columns).toHaveLength(4);

    // title skeleton + 4 match skeletons
    expect(columns[0].querySelectorAll('[data-testid="skeleton"]')).toHaveLength(5);

    // title skeleton + 2 match skeletons
    expect(columns[1].querySelectorAll('[data-testid="skeleton"]')).toHaveLength(3);

    expect(columns[2].querySelectorAll('[data-testid="skeleton"]')).toHaveLength(3);

    expect(columns[3].querySelectorAll('[data-testid="skeleton"]')).toHaveLength(3);
  });

  it('renders the expected total number of placeholders', () => {
    render(<BracketSkeleton />);

    // mobile: 7
    // desktop:
    //   column titles: 4
    //   first column cards: 4
    //   remaining columns: 2 * 3
    // total = 21
    expect(screen.getAllByTestId('skeleton')).toHaveLength(21);
  });
});
