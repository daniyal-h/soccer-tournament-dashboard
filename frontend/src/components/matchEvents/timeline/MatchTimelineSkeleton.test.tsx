import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import MatchTimelineSkeleton from '@/components/matchEvents/timeline/MatchTimelineSkeleton';

describe('MatchTimelineSkeleton', () => {
  it('renders four timeline event placeholders', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    const events = container.querySelectorAll(
      '.grid-cols-\\[minmax\\(0\\,1fr\\)_auto_minmax\\(0\\,1fr\\)\\]',
    );

    expect(events).toHaveLength(4);
  });

  it('renders the vertical timeline line', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    const timelineLine = container.querySelector('.absolute.left-1\\/2');

    expect(timelineLine).toBeInTheDocument();
    expect(timelineLine).toHaveClass('h-full');
  });

  it('renders center time placeholders for every event', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    const centerMarkers = container.querySelectorAll('.h-10.w-14');

    expect(centerMarkers).toHaveLength(4);
  });

  it('renders cards on both left and right sides', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    const leftColumns = container.querySelectorAll('.justify-end');
    const rightColumns = container.querySelectorAll('.justify-start');

    expect(leftColumns[0]).not.toBeEmptyDOMElement();
    expect(rightColumns[0]).toBeEmptyDOMElement();

    expect(leftColumns[1]).toBeEmptyDOMElement();
    expect(rightColumns[1]).not.toBeEmptyDOMElement();
  });

  it('only renders score placeholders for events with scores', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    const scoreSkeletons = container.querySelectorAll('.mt-4.h-8.w-16');

    expect(scoreSkeletons).toHaveLength(2);
  });

  it('renders variable name width placeholders', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    expect(container.querySelector('.w-28')).toBeInTheDocument();
    expect(container.querySelector('.w-36')).toBeInTheDocument();
    expect(container.querySelector('.w-32')).toBeInTheDocument();
    expect(container.querySelector('.w-24')).toBeInTheDocument();
  });

  it('renders score placeholders only on the first and fourth skeleton cards', () => {
    const { container } = render(<MatchTimelineSkeleton />);

    const eventRows = container.querySelectorAll(
      '.grid-cols-\\[minmax\\(0\\,1fr\\)_auto_minmax\\(0\\,1fr\\)\\]',
    );

    expect(eventRows[0].querySelector('.mt-4.h-8.w-16')).toBeInTheDocument();
    expect(eventRows[1].querySelector('.mt-4.h-8.w-16')).not.toBeInTheDocument();
    expect(eventRows[2].querySelector('.mt-4.h-8.w-16')).not.toBeInTheDocument();
    expect(eventRows[3].querySelector('.mt-4.h-8.w-16')).toBeInTheDocument();
  });
});
