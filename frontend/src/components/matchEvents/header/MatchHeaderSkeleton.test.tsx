import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MatchHeaderSkeleton from '@/components/matchEvents/header/MatchHeaderSkeleton';

describe('MatchHeaderSkeleton', () => {
  it('renders all loading placeholders', () => {
    const { container } = render(<MatchHeaderSkeleton />);

    const skeletons = container.querySelectorAll('[data-slot="skeleton"]');

    expect(skeletons).toHaveLength(12);
  });

  it('renders the header skeleton inside a card container', () => {
    const { container } = render(<MatchHeaderSkeleton />);

    const card = container.firstElementChild;

    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('mb-10');
    expect(card).toHaveClass('p-6');
  });

  it('renders placeholders for both teams', () => {
    const { container } = render(<MatchHeaderSkeleton />);

    const logoSkeletons = container.querySelectorAll('.h-10.w-10');

    expect(logoSkeletons).toHaveLength(2);
  });

  it('renders placeholders for score and match metadata sections', () => {
    const { container } = render(<MatchHeaderSkeleton />);

    expect(container.querySelector('.h-9.w-16')).toBeInTheDocument();
    expect(container.querySelector('.h-5.w-36')).toBeInTheDocument();
    expect(container.querySelector('.h-5.w-44')).toBeInTheDocument();
  });
});
