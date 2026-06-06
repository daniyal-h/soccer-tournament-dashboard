import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MatchTimeline from '@/components/matchEvents/timeline/MatchTimeline';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import { addDisplayScoresToEvents } from '@/utils/matchEvents/EventCardHelper';
import {
  buildTimelineItems,
  getEventKey,
  getPreviousEventMinute,
} from '@/utils/matchEvents/matchEventHelper';

vi.mock('@/components/feedback/EmptyState', () => ({
  default: ({ description }: { description: string }) => <div>{description}</div>,
}));

vi.mock('@/components/matchEvents/timeline/MatchTimelineSkeleton', () => ({
  default: () => <div>Timeline Skeleton</div>,
}));

vi.mock('@/components/matchEvents/timeline/TimelineEvent', () => ({
  default: ({
    event,
    score,
    previousMinute,
  }: {
    event: MatchEvent;
    score: string;
    previousMinute?: number;
  }) => (
    <div>
      Event {event.minute} {score} Previous {previousMinute ?? 'none'}
    </div>
  ),
}));

vi.mock('@/components/matchEvents/timeline/TimelineMarker', () => ({
  default: ({ label, minute }: { label: string; minute: number }) => (
    <div>
      Marker {label} {minute}
    </div>
  ),
}));

vi.mock('@/utils/matchEvents/EventCardHelper');
vi.mock('@/utils/matchEvents/matchEventHelper');

const mockAddDisplayScoresToEvents = vi.mocked(addDisplayScoresToEvents);
const mockBuildTimelineItems = vi.mocked(buildTimelineItems);
const mockGetEventKey = vi.mocked(getEventKey);
const mockGetPreviousEventMinute = vi.mocked(getPreviousEventMinute);

const team = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
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
  team_a: team,
  team_b: {
    ...team,
    id: 2,
    name: 'Brazil',
  },
  elapsed: 70,
  team_a_score: 1,
  team_b_score: 1,
  team_a_penalties: null,
  team_b_penalties: null,
};

function makeEvent(minute: number): MatchEvent {
  return {
    team,
    player: null,
    secondary_player: null,
    player_name: null,
    secondary_player_name: null,
    player_external_id: null,
    secondary_player_external_id: null,
    event_type: 'goal',
    minute,
    extra_minute: null,
    detail: null,
    comments: null,
  };
}

describe('MatchTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetEventKey.mockImplementation((event) => String(event.minute));
    mockGetPreviousEventMinute.mockReturnValue(undefined);
  });

  it('renders the loading skeleton and skips timeline processing', () => {
    render(
      <MatchTimeline isLoading match={baseMatch} events={[makeEvent(10)]} emptyState={null} />,
    );

    expect(screen.getByText('Timeline Skeleton')).toBeInTheDocument();

    expect(mockAddDisplayScoresToEvents).not.toHaveBeenCalled();
    expect(mockBuildTimelineItems).not.toHaveBeenCalled();
  });

  it('renders empty state and skips timeline processing', () => {
    render(
      <MatchTimeline isLoading={false} match={baseMatch} events={[]} emptyState="No events yet" />,
    );

    expect(screen.getByText('No events yet')).toBeInTheDocument();

    expect(mockAddDisplayScoresToEvents).not.toHaveBeenCalled();
    expect(mockBuildTimelineItems).not.toHaveBeenCalled();
  });

  it('sorts events before adding display scores', () => {
    const lateEvent = makeEvent(80);
    const earlyEvent = makeEvent(10);

    mockAddDisplayScoresToEvents.mockReturnValue([]);
    mockBuildTimelineItems.mockReturnValue([]);

    render(
      <MatchTimeline
        isLoading={false}
        match={baseMatch}
        events={[lateEvent, earlyEvent]}
        emptyState={null}
      />,
    );

    expect(mockAddDisplayScoresToEvents).toHaveBeenCalledWith([earlyEvent, lateEvent], baseMatch);
  });

  it('renders timeline events and markers', () => {
    const event = makeEvent(25);

    mockAddDisplayScoresToEvents.mockReturnValue([{ event, score: '1-0' }]);

    mockBuildTimelineItems.mockReturnValue([
      {
        type: 'event',
        event,
        minute: 25,
        order: 0,
        score: '1-0',
      },
      {
        type: 'marker',
        minute: 45,
        order: 0,
        label: 'HALF TIME',
      },
    ]);

    render(
      <MatchTimeline isLoading={false} match={baseMatch} events={[event]} emptyState={null} />,
    );

    expect(screen.getByText('Event 25 1-0 Previous none')).toBeInTheDocument();
    expect(screen.getByText('Marker HALF TIME 45')).toBeInTheDocument();
  });

  it('passes previous event minute to timeline events', () => {
    const event = makeEvent(50);

    mockAddDisplayScoresToEvents.mockReturnValue([{ event, score: '2-1' }]);

    const timelineItems = [
      {
        type: 'event' as const,
        event,
        minute: 50,
        order: 0,
        score: '2-1',
      },
    ];

    mockBuildTimelineItems.mockReturnValue(timelineItems);
    mockGetPreviousEventMinute.mockReturnValue(30);

    render(
      <MatchTimeline isLoading={false} match={baseMatch} events={[event]} emptyState={null} />,
    );

    expect(mockGetPreviousEventMinute).toHaveBeenCalledWith(timelineItems, 0);
    expect(screen.getByText('Event 50 2-1 Previous 30')).toBeInTheDocument();
  });
});
