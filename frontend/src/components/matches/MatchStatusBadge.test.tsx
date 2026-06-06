import { cleanup, render, screen } from '@testing-library/react';
import type React from 'react';
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

  it.each([
    { status: 'scheduled' as const, text: 'Scheduled', className: 'scheduled-class' },
    { status: 'finished' as const, text: 'Finished', className: 'finished-class' },
    { status: 'postponed' as const, text: 'Postponed', className: 'postponed-class' },
    { status: 'cancelled' as const, text: 'Cancelled', className: 'cancelled-class' },
  ])('renders the $status status without elapsed time', ({ status, text, className }) => {
    render(<MatchStatusBadge status={status} elapsed={null} />);

    const badge = screen.getByTestId('badge');

    expect(badge).toHaveTextContent(new RegExp(`^${text}$`));
    expect(badge).toHaveClass('text-medium', className);
    expect(badge).not.toHaveTextContent('·');
    expect(badge).not.toHaveTextContent("'");
  });

  it('applies the shared base class and live-specific class', () => {
    render(<MatchStatusBadge status="live" elapsed={null} />);

    expect(screen.getByTestId('badge')).toHaveClass('text-medium', 'live-class');
  });

  it.each([0, 1, 45, 67, 90])(
    'renders elapsed minute %i for live matches with exact separator and apostrophe',
    (elapsed) => {
      render(<MatchStatusBadge status="live" elapsed={elapsed} />);

      expect(screen.getByTestId('badge')).toHaveTextContent(new RegExp(`^Live · ${elapsed}'$`));
    },
  );

  it('does not render elapsed punctuation for live matches when elapsed is null', () => {
    render(<MatchStatusBadge status="live" elapsed={null} />);

    const badge = screen.getByTestId('badge');

    expect(badge).toHaveTextContent(/^Live$/);
    expect(badge).not.toHaveTextContent('·');
    expect(badge).not.toHaveTextContent("'");
  });

  it.each([
    { status: 'scheduled' as const, text: 'Scheduled' },
    { status: 'finished' as const, text: 'Finished' },
    { status: 'postponed' as const, text: 'Postponed' },
    { status: 'cancelled' as const, text: 'Cancelled' },
  ])('ignores elapsed time for $status matches', ({ status, text }) => {
    render(<MatchStatusBadge status={status} elapsed={90} />);

    const badge = screen.getByTestId('badge');

    expect(badge).toHaveTextContent(new RegExp(`^${text}$`));
    expect(badge).not.toHaveTextContent('90');
    expect(badge).not.toHaveTextContent('·');
    expect(badge).not.toHaveTextContent("'");
  });

  it('updates the displayed elapsed time when the live elapsed prop changes', () => {
    const { rerender } = render(<MatchStatusBadge status="live" elapsed={12} />);

    expect(screen.getByTestId('badge')).toHaveTextContent(/^Live · 12'$/);

    rerender(<MatchStatusBadge status="live" elapsed={13} />);

    expect(screen.getByTestId('badge')).toHaveTextContent(/^Live · 13'$/);
    expect(screen.getByTestId('badge')).not.toHaveTextContent("12'");
  });

  it('removes elapsed time when a live match changes from a minute value to null', () => {
    const { rerender } = render(<MatchStatusBadge status="live" elapsed={34} />);

    expect(screen.getByTestId('badge')).toHaveTextContent(/^Live · 34'$/);

    rerender(<MatchStatusBadge status="live" elapsed={null} />);

    const badge = screen.getByTestId('badge');

    expect(badge).toHaveTextContent(/^Live$/);
    expect(badge).not.toHaveTextContent('34');
    expect(badge).not.toHaveTextContent('·');
  });
});
