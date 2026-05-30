import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ScheduleSkeleton from './ScheduleSkeleton';

vi.mock('@/components/ui/card', () => ({
  Card: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={className} data-testid="card">
      {children}
    </div>
  ),
  CardContent: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={className} data-testid="card-content">
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid="skeleton" />
  ),
}));

describe('ScheduleSkeleton', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders the schedule skeleton container', () => {
    render(<ScheduleSkeleton />);

    expect(screen.getByTestId('schedule-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('schedule-skeleton')).toHaveClass('space-y-6', 'pt-2');
  });

  it('renders two skeleton day sections', () => {
    const { container } = render(<ScheduleSkeleton />);

    const daySections = container.querySelectorAll('.border-b');

    expect(daySections).toHaveLength(2);
  });

  it('renders four match cards per day for a total of eight cards', () => {
    render(<ScheduleSkeleton />);

    expect(screen.getAllByTestId('card')).toHaveLength(8);
    expect(screen.getAllByTestId('card-content')).toHaveLength(8);
  });

  it('applies the expected card styling', () => {
    render(<ScheduleSkeleton />);

    screen.getAllByTestId('card').forEach((card) => {
      expect(card).toHaveClass('w-full', 'shadow-sm');
    });

    screen.getAllByTestId('card-content').forEach((content) => {
      expect(content).toHaveClass('min-w-0', 'space-y-3', 'p-4');
    });
  });

  it('renders the expected number of skeleton placeholders', () => {
    render(<ScheduleSkeleton />);

    // Per day:
    // 2 accordion skeletons
    // 4 cards × 7 skeletons each
    // = 30 per day
    //
    // 2 days = 60
    expect(screen.getAllByTestId('skeleton')).toHaveLength(60);
  });

  it('renders accordion trigger skeletons for each day', () => {
    render(<ScheduleSkeleton />);

    const accordionBarSkeletons = screen
      .getAllByTestId('skeleton')
      .filter(
        (element) =>
          element.className.includes('h-5 w-20') || element.className.includes('h-4 w-4'),
      );

    expect(accordionBarSkeletons).toHaveLength(4);
  });

  it('renders the responsive match card grid for each day', () => {
    const { container } = render(<ScheduleSkeleton />);

    const grids = container.querySelectorAll('.grid.gap-4.md\\:grid-cols-2');

    expect(grids).toHaveLength(2);
  });

  it('renders score-row skeleton placeholders inside every card', () => {
    render(<ScheduleSkeleton />);

    const centerScoreSkeletons = screen
      .getAllByTestId('skeleton')
      .filter((element) => element.className.includes('mx-4 h-5 w-16'));

    expect(centerScoreSkeletons).toHaveLength(8);
  });

  it('renders metadata skeleton placeholders inside every card', () => {
    render(<ScheduleSkeleton />);

    const metadataSkeletons = screen
      .getAllByTestId('skeleton')
      .filter((element) => element.className.includes('h-4 w-2/3'));

    expect(metadataSkeletons).toHaveLength(8);
  });
});
