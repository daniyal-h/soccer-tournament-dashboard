import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import MatchStatusBadge from './MatchStatusBadge';

vi.mock('@/constants/matches', () => ({
  MATCH_STATUS_BADGE: {
    scheduled: {
      text: 'Scheduled',
      className: 'scheduled-class',
    },
    live: {
      text: 'Live',
      className: 'live-class',
    },
    finished: {
      text: 'Finished',
      className: 'finished-class',
    },
    postponed: {
      text: 'Postponed',
      className: 'postponed-class',
    },
    cancelled: {
      text: 'Cancelled',
      className: 'cancelled-class',
    },
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

vi.mock('../ui/badge', () => ({
  Badge: ({ className, children }: { className?: string; children: React.ReactNode }) => (
    <div className={className} data-testid="badge">
      {children}
    </div>
  ),
}));

describe('MatchStatusBadge', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders scheduled status text', () => {
    render(<MatchStatusBadge status="scheduled" />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Scheduled');
  });

  it('renders finished status text', () => {
    render(<MatchStatusBadge status="finished" />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Finished');
  });

  it('applies the shared base class and status-specific class', () => {
    render(<MatchStatusBadge status="scheduled" />);

    expect(screen.getByTestId('badge')).toHaveClass('text-medium', 'scheduled-class');
  });

  it('renders elapsed time for live matches', () => {
    render(<MatchStatusBadge status="live" elapsed={67} />);

    expect(screen.getByTestId('badge')).toHaveTextContent("Live · 67'");
  });

  it('renders elapsed time when live match is at minute zero', () => {
    render(<MatchStatusBadge status="live" elapsed={0} />);

    expect(screen.getByTestId('badge')).toHaveTextContent("Live · 0'");
  });

  it('does not render elapsed time when live match elapsed is undefined', () => {
    render(<MatchStatusBadge status="live" />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Live');
    expect(screen.getByTestId('badge')).not.toHaveTextContent("'");
  });

  it('does not render elapsed time when live match elapsed is null', () => {
    render(<MatchStatusBadge status="live" elapsed={null as never} />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Live');
    expect(screen.getByTestId('badge')).not.toHaveTextContent("'");
  });

  it('does not render elapsed time for non-live matches even when elapsed exists', () => {
    render(<MatchStatusBadge status="finished" elapsed={90} />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Finished');
    expect(screen.getByTestId('badge')).not.toHaveTextContent('90');
  });

  it('renders postponed status correctly', () => {
    render(<MatchStatusBadge status="postponed" />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Postponed');
    expect(screen.getByTestId('badge')).toHaveClass('postponed-class');
  });

  it('renders cancelled status correctly', () => {
    render(<MatchStatusBadge status="cancelled" />);

    expect(screen.getByTestId('badge')).toHaveTextContent('Cancelled');
    expect(screen.getByTestId('badge')).toHaveClass('cancelled-class');
  });
});
