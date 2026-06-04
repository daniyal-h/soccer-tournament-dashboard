import { describe, expect, it } from 'vitest';

import type { Match } from '@/types/match';
import type { MatchEvent, TimelineItem } from '@/types/matchEvent';

import {
  MAX_TIMELINE_EVENT_GAP_PX,
  MIN_TIMELINE_EVENT_GAP_PX,
  PENALTY_SHOOTOUT_COMMENT,
} from '@/constants/matchEvents';

import {
  buildTimelineItems,
  calculateTimeGap,
  getEventKey,
  getPreviousEventMinute,
  isPenaltyShootoutEvent,
} from '@/utils/matchEvents/matchEventHelper';

const teamA = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: '',
};

const teamB = {
  id: 2,
  name: 'Belgium',
  short_name: 'BEL',
  logo_url: '',
};

const player = {
  id: 10,
  external_api_id: 100,
  first_name: 'Alphonso',
  last_name: 'Davies',
  photo_url: null,
  nationality: 'Canada',
};

const secondaryPlayer = {
  id: 11,
  external_api_id: 101,
  first_name: 'Jonathan',
  last_name: 'David',
  photo_url: null,
  nationality: 'Canada',
};

const baseMatch: Match = {
  id: 1,
  team_a: teamA,
  team_b: teamB,
  kickoff_time: '2026-06-12T20:00:00Z',
  venue: null,
  city: null,
  stage: 'group',
  group: null,
  status: 'live',
  elapsed: 0,
  team_a_score: null,
  team_b_score: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

const baseEvent: MatchEvent = {
  team: teamA,
  player,
  secondary_player: secondaryPlayer,
  event_type: 'goal',
  minute: 12,
};

function makeEvent(overrides: Partial<MatchEvent> = {}): MatchEvent {
  return {
    ...baseEvent,
    ...overrides,
  };
}

describe('getEventKey', () => {
  it('builds a stable key from minute, team, players, and event type', () => {
    expect(getEventKey(baseEvent)).toBe('12-Canada-Davies-goal-David');
  });

  it('uses empty segments when player fields are missing', () => {
    const event = makeEvent({
      player: undefined,
      secondary_player: undefined,
      event_type: 'yellow_card',
      minute: 45,
      team: teamB,
    });

    expect(getEventKey(event)).toBe('45-Belgium--yellow_card-');
  });
});

describe('isPenaltyShootoutEvent', () => {
  it('returns true only for penalty shootout comments', () => {
    expect(isPenaltyShootoutEvent(makeEvent({ comments: PENALTY_SHOOTOUT_COMMENT }))).toBe(true);
    expect(isPenaltyShootoutEvent(makeEvent({ comments: 'Penalty' }))).toBe(false);
    expect(isPenaltyShootoutEvent(makeEvent({ comments: undefined }))).toBe(false);
  });
});

describe('buildTimelineItems', () => {
  it('sorts events by minute and adds half-time marker when elapsed reaches 45', () => {
    const items = buildTimelineItems(
      [
        { event: makeEvent({ minute: 60, event_type: 'goal' }), score: '1-0' },
        { event: makeEvent({ minute: 10, event_type: 'yellow_card' }), score: '0-0' },
      ],
      { ...baseMatch, elapsed: 45 },
    );

    expect(items).toEqual([
      expect.objectContaining({ type: 'event', minute: 10, order: 0, score: '0-0' }),
      expect.objectContaining({ type: 'marker', minute: 45, order: 0, label: 'HALF TIME' }),
      expect.objectContaining({ type: 'event', minute: 60, order: 0, score: '1-0' }),
    ]);
  });

  it('adds full-time marker without extra-time markers when elapsed reaches 90 only', () => {
    const items = buildTimelineItems([], { ...baseMatch, elapsed: 90 });

    expect(items).toEqual([
      expect.objectContaining({ type: 'marker', minute: 45, label: 'HALF TIME' }),
      expect.objectContaining({ type: 'marker', minute: 90, label: 'FULL TIME' }),
    ]);

    expect(items).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: 'END OF REGULATION' }),
        expect.objectContaining({ label: 'ET HALF TIME' }),
        expect.objectContaining({ label: 'END OF EXTRA TIME' }),
      ]),
    );
  });

  it('adds extra-time markers instead of full-time marker when elapsed reaches 120', () => {
    const items = buildTimelineItems([], { ...baseMatch, elapsed: 120 });

    expect(items).toEqual([
      expect.objectContaining({ type: 'marker', minute: 45, label: 'HALF TIME' }),
      expect.objectContaining({ type: 'marker', minute: 90, label: 'END OF REGULATION' }),
      expect.objectContaining({ type: 'marker', minute: 105, label: 'ET HALF TIME' }),
      expect.objectContaining({ type: 'marker', minute: 120, label: 'END OF EXTRA TIME' }),
    ]);

    expect(items).not.toEqual(
      expect.arrayContaining([expect.objectContaining({ label: 'FULL TIME' })]),
    );
  });

  it('adds shootout markers and orders penalty events between them', () => {
    const shootoutEvent = makeEvent({
      minute: 120,
      comments: PENALTY_SHOOTOUT_COMMENT,
      event_type: 'penalty_goal',
    });

    const items = buildTimelineItems([{ event: shootoutEvent, score: '4-3' }], {
      ...baseMatch,
      elapsed: 120,
    });

    expect(items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'marker',
          minute: 120,
          order: 1,
          label: 'PENALTY SHOOTOUT',
        }),
        expect.objectContaining({ type: 'event', minute: 120, order: 2, event: shootoutEvent }),
        expect.objectContaining({
          type: 'marker',
          minute: 120,
          order: 3,
          label: 'END OF SHOOTOUT',
        }),
      ]),
    );

    const shootoutSection = items.filter((item) => item.minute === 120);

    expect(shootoutSection.map((item) => item.order)).toEqual([0, 1, 2, 3]);
  });

  it('does not add elapsed markers when elapsed is zero or undefined', () => {
    expect(buildTimelineItems([], { ...baseMatch, elapsed: 0 })).toEqual([]);
    expect(buildTimelineItems([], { ...baseMatch, elapsed: null })).toEqual([]);
  });
});

describe('getPreviousEventMinute', () => {
  it('returns the nearest previous event minute while skipping markers', () => {
    const items: TimelineItem[] = [
      { type: 'event', minute: 10, order: 0, event: makeEvent({ minute: 10 }), score: '0-0' },
      { type: 'marker', minute: 45, order: 0, label: 'HALF TIME' },
      { type: 'marker', minute: 90, order: 0, label: 'FULL TIME' },
      { type: 'event', minute: 92, order: 0, event: makeEvent({ minute: 92 }), score: '1-0' },
    ];

    expect(getPreviousEventMinute(items, 3)).toBe(10);
  });

  it('returns undefined when no previous event exists', () => {
    const items: TimelineItem[] = [
      { type: 'marker', minute: 45, order: 0, label: 'HALF TIME' },
      { type: 'event', minute: 60, order: 0, event: makeEvent({ minute: 60 }), score: '1-0' },
    ];

    expect(getPreviousEventMinute(items, 0)).toBeUndefined();
    expect(getPreviousEventMinute(items, 1)).toBeUndefined();
  });
});

describe('calculateTimeGap', () => {
  it('returns the minimum gap when there is no previous minute', () => {
    expect(calculateTimeGap(20)).toBe(MIN_TIMELINE_EVENT_GAP_PX);
  });

  it('clamps negative and zero minute differences to the minimum gap', () => {
    expect(calculateTimeGap(20, 20)).toBe(MIN_TIMELINE_EVENT_GAP_PX);
    expect(calculateTimeGap(15, 20)).toBe(MIN_TIMELINE_EVENT_GAP_PX);
  });

  it('uses a proportional gap when it falls between the min and max', () => {
    expect(calculateTimeGap(30, 20)).toBe(36);
  });

  it('clamps large gaps to the maximum gap', () => {
    expect(calculateTimeGap(100, 20)).toBe(MAX_TIMELINE_EVENT_GAP_PX);
  });
});
