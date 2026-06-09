import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import TimelineMarker from '@/components/matchEvents/timeline/TimelineMarker';

import { TIMELINE_MARKERS } from '@/constants/matchEvents';

describe('TimelineMarker', () => {
  it('renders the marker minute and label', () => {
    render(<TimelineMarker minute={45} label="HALF TIME" />);

    expect(screen.getByText("45'")).toBeInTheDocument();
    expect(screen.getByText('HALF TIME')).toBeInTheDocument();
  });

  it('does not render the minute for end of shootout marker', () => {
    render(<TimelineMarker minute={120} label={TIMELINE_MARKERS.END_OF_SHOOTOUT.label} />);

    expect(screen.queryByText("120'")).not.toBeInTheDocument();
    expect(screen.getByText(TIMELINE_MARKERS.END_OF_SHOOTOUT.label)).toBeInTheDocument();
  });

  it('applies marker layout styling', () => {
    const { container } = render(<TimelineMarker minute={90} label="FULL TIME" />);

    const wrapper = container.firstElementChild;
    const pill = wrapper?.firstElementChild;

    expect(wrapper).toHaveClass('relative', 'my-8', 'flex', 'justify-center');
    expect(pill).toHaveClass(
      'z-10',
      'flex',
      'items-center',
      'gap-2',
      'rounded-full',
      'border',
      'bg-background',
      'px-4',
      'py-1',
      'shadow-sm',
    );
  });

  it('applies text styling to minute and label', () => {
    render(<TimelineMarker minute={105} label="EXTRA TIME" />);

    expect(screen.getByText("105'")).toHaveClass('text-xs', 'font-bold');

    expect(screen.getByText('EXTRA TIME')).toHaveClass(
      'text-xs',
      'font-semibold',
      'uppercase',
      'tracking-wide',
      'text-muted-foreground',
    );
  });
});
