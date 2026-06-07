import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import MatchDetailsContent from '@/components/matchEvents/MatchDetailsContent';

import { useMatch } from '@/hooks/useMatch';
import { useMatchEvents } from '@/hooks/useMatchEvents';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

vi.mock('@/hooks/useMatch');
vi.mock('@/hooks/useMatchEvents');

vi.mock('@/components/feedback/ErrorState', () => ({
  default: ({
    title,
    description,
    onAction,
  }: {
    title: string;
    description: string;
    onAction?: () => void;
  }) => (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
      {onAction && <button onClick={onAction}>Try again</button>}
    </section>
  ),
}));

vi.mock('@/components/matchEvents/header/MatchHeader', () => ({
  default: ({ match }: { match: Match }) => <div>Match Header: {match.id}</div>,
}));

vi.mock('@/components/matchEvents/header/MatchHeaderSkeleton', () => ({
  default: () => <div>Match Header Skeleton</div>,
}));

vi.mock('@/components/matchEvents/timeline/MatchTimeline', () => ({
  default: ({
    match,
    events,
    isLoading,
    emptyState,
  }: {
    match: Match;
    events: MatchEvent[];
    isLoading: boolean;
    emptyState: string | null;
  }) => (
    <div>
      <p>Timeline Match: {match.id}</p>
      <p>Timeline Events: {events.length}</p>
      <p>Timeline Loading: {String(isLoading)}</p>
      <p>Timeline Empty State: {emptyState ?? 'none'}</p>
    </div>
  ),
}));

const mockUseMatch = vi.mocked(useMatch);
const mockUseMatchEvents = vi.mocked(useMatchEvents);

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  team_a: {
    id: 10,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'https://example.com/canada.png',
  },
  team_b: {
    id: 20,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: 'https://example.com/brazil.png',
  },
  elapsed: null,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

const baseEvent: MatchEvent = {
  team: baseMatch.team_a,
  player: null,
  secondary_player: null,
  player_name: 'Alphonso Davies',
  secondary_player_name: null,
  player_external_id: 100,
  secondary_player_external_id: null,
  event_type: 'goal',
  minute: 12,
  extra_minute: null,
  detail: null,
  comments: null,
};

function mockMatchState(overrides: Partial<ReturnType<typeof useMatch>> = {}) {
  mockUseMatch.mockReturnValue({
    match: baseMatch,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
    canRetry: false,
    ...overrides,
  });
}

function mockEventsState(overrides: Partial<ReturnType<typeof useMatchEvents>> = {}) {
  mockUseMatchEvents.mockReturnValue({
    matchEvents: [baseEvent],
    metadata: null,
    isLoading: false,
    error: null,
    emptyState: null,
    refetch: vi.fn(),
    canRetry: false,
    ...overrides,
  });
}

describe('MatchDetailsContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchState();
    mockEventsState();
  });

  it('calls match and match-events hooks with the provided match id', () => {
    render(<MatchDetailsContent matchId={7} />);

    expect(mockUseMatch).toHaveBeenCalledWith(7);
    expect(mockUseMatchEvents).toHaveBeenCalledWith({ match_id: 7 });
  });

  it('renders the match skeleton while the match is loading', () => {
    mockMatchState({ isLoading: true });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Header Skeleton')).toBeInTheDocument();
    expect(screen.queryByText('Match Header: 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Timeline Match: 1')).not.toBeInTheDocument();
  });

  it('renders match error state with retry action when match retry is allowed', () => {
    const refetchMatch = vi.fn();

    mockMatchState({
      match: null,
      error: new Error('Failed to load match.'),
      refetch: refetchMatch,
      canRetry: true,
    });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load match.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetchMatch).toHaveBeenCalledOnce();
  });

  it('renders match error state without retry action when match retry is not allowed', () => {
    mockMatchState({
      match: null,
      error: new Error('Invalid match id.'),
      canRetry: false,
    });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Invalid match id.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });

  it('renders not-found error state when match is null without an error', () => {
    mockMatchState({ match: null });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Match not found.')).toBeInTheDocument();
    expect(screen.queryByText('Match Header: 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Timeline Match: 1')).not.toBeInTheDocument();
  });

  it('renders match header and timeline when match and events are available', () => {
    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Header: 1')).toBeInTheDocument();
    expect(screen.getByText('Timeline Match: 1')).toBeInTheDocument();
    expect(screen.getByText('Timeline Events: 1')).toBeInTheDocument();
    expect(screen.getByText('Timeline Loading: false')).toBeInTheDocument();
    expect(screen.getByText('Timeline Empty State: none')).toBeInTheDocument();
  });

  it('passes event loading and empty state to the timeline', () => {
    mockEventsState({
      matchEvents: [],
      isLoading: true,
      emptyState: 'No events yet.',
    });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Header: 1')).toBeInTheDocument();
    expect(screen.getByText('Timeline Events: 0')).toBeInTheDocument();
    expect(screen.getByText('Timeline Loading: true')).toBeInTheDocument();
    expect(screen.getByText('Timeline Empty State: No events yet.')).toBeInTheDocument();
  });

  it('renders events error state instead of timeline when events fail', () => {
    mockEventsState({
      error: new Error('Failed to load events.'),
    });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Header: 1')).toBeInTheDocument();
    expect(screen.getByText('Match Events Unavailable')).toBeInTheDocument();
    expect(screen.getByText('Failed to load events.')).toBeInTheDocument();
    expect(screen.queryByText('Timeline Match: 1')).not.toBeInTheDocument();
  });

  it('renders events error retry action when events retry is allowed', () => {
    const refetchEvents = vi.fn();

    mockEventsState({
      error: new Error('Temporary events error.'),
      refetch: refetchEvents,
      canRetry: true,
    });

    render(<MatchDetailsContent matchId={1} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));

    expect(refetchEvents).toHaveBeenCalledOnce();
  });

  it('does not render events retry action when events retry is not allowed', () => {
    mockEventsState({
      error: new Error('Events unavailable.'),
      canRetry: false,
    });

    render(<MatchDetailsContent matchId={1} />);

    expect(screen.getByText('Match Events Unavailable')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });
});
