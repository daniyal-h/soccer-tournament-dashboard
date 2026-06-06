import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TimelineEvent from '@/components/matchEvents/timeline/TimelineEvent';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import { calculateTimeGap } from '@/utils/matchEvents/matchEventHelper';

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      children,
      style,
      className,
    }: {
      children: React.ReactNode;
      style?: React.CSSProperties;
      className?: string;
    }) => (
      <div style={style} className={className} data-testid="motion-div">
        {children}
      </div>
    ),
  },
}));

vi.mock('@/utils/matchEvents/matchEventHelper', () => ({
  calculateTimeGap: vi.fn(),
}));

vi.mock('@/components/matchEvents/timeline/EventCard', () => ({
  default: ({ score }: { score: string }) => (
    <div data-testid="event-card">Event Card: {score}</div>
  ),
}));

const mockCalculateTimeGap = vi.mocked(calculateTimeGap);

const teamA = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: null,
};

const teamB = {
  id: 2,
  name: 'Brazil',
  short_name: 'BRA',
  logo_url: null,
};

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'live',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  team_a: teamA,
  team_b: teamB,
  elapsed: 67,
  team_a_score: 2,
  team_b_score: 1,
  team_a_penalties: null,
  team_b_penalties: null,
};

const baseEvent: MatchEvent = {
  team: teamA,
  player: null,
  secondary_player: null,
  player_name: 'Alphonso Davies',
  secondary_player_name: null,
  player_external_id: null,
  secondary_player_external_id: null,
  event_type: 'goal',
  minute: 34,
  extra_minute: null,
  detail: null,
  comments: null,
};

function makeEvent(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return {
    ...baseEvent,
    ...overrides,
  };
}

describe('TimelineEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCalculateTimeGap.mockReturnValue(50);
  });

  it('calculates and applies the timeline gap', () => {
    render(<TimelineEvent event={baseEvent} match={baseMatch} previousMinute={20} score="1-0" />);

    expect(mockCalculateTimeGap).toHaveBeenCalledWith(34, 20);
    expect(screen.getByTestId('motion-div')).toHaveStyle({
      marginTop: '50px',
    });
  });

  it('renders event minute in the center timeline', () => {
    render(<TimelineEvent event={baseEvent} match={baseMatch} score="1-0" />);

    expect(screen.getByText("34'")).toBeInTheDocument();
  });

  it('renders team A events on the left side', () => {
    const { container } = render(
      <TimelineEvent event={makeEvent({ team: teamA })} match={baseMatch} score="1-0" />,
    );

    const columns = container.querySelectorAll('.min-w-0');

    expect(columns[0]).toHaveTextContent('Event Card: 1-0');
    expect(columns[1]).toBeEmptyDOMElement();
  });

  it('renders team B events on the right side', () => {
    const { container } = render(
      <TimelineEvent event={makeEvent({ team: teamB })} match={baseMatch} score="1-1" />,
    );

    const columns = container.querySelectorAll('.min-w-0');

    expect(columns[0]).toBeEmptyDOMElement();
    expect(columns[1]).toHaveTextContent('Event Card: 1-1');
  });

  it('passes undefined previous minute to gap calculation when there is no previous event', () => {
    render(<TimelineEvent event={baseEvent} match={baseMatch} score="1-0" />);

    expect(mockCalculateTimeGap).toHaveBeenCalledWith(34, undefined);
  });
});
