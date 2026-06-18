import { describe, expect, it } from 'vitest';

import type { Match } from '@/types/match';
import type { MatchEvent } from '@/types/matchEvent';

import { PENALTY_SHOOTOUT_COMMENT } from '@/constants/matchEvents';
import { EVENT_CONFIG } from '@/constants/matchEventsDisplay';

import {
  addDisplayScoresToEvents,
  formatEventMinute,
  getEventConfig,
  getPlayerName,
  getSecondaryPlayerName,
} from '@/utils/matchEvents/EventCardHelper';

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

const player = {
  id: 10,
  external_api_id: 100,
  display_name: 'A. Davies',
  first_name: 'Alphonso',
  last_name: 'Davies',
  photo_url: null,
  nationality: 'Canada',
  date_of_birth: null,
  height: null,
};

const secondaryPlayer = {
  id: 11,
  external_api_id: 101,
  display_name: 'J. David',
  first_name: 'Jonathan',
  last_name: 'David',
  photo_url: null,
  nationality: 'Canada',
  date_of_birth: null,
  height: null,
};

const baseMatch: Match = {
  id: 1,
  team_a: teamA,
  team_b: teamB,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'live',
  venue: 'Estadio Azteca',
  city: 'Mexico City',
  elapsed: 67,
  team_a_score: 2,
  team_b_score: 1,
  team_a_penalties: null,
  team_b_penalties: null,
};

const baseEvent: MatchEvent = {
  team: teamA,
  player,
  secondary_player: secondaryPlayer,
  player_name: null,
  secondary_player_name: null,
  player_external_id: null,
  secondary_player_external_id: null,
  event_type: 'goal',
  minute: 12,
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

describe('formatEventMinute', () => {
  it('formats regular minutes', () => {
    expect(formatEventMinute(makeEvent({ minute: 24, extra_minute: null }))).toBe("24'");
  });

  it('formats stoppage-time minutes', () => {
    expect(formatEventMinute(makeEvent({ minute: 45, extra_minute: 3 }))).toBe("45+3'");
  });

  it('does not add stoppage time when extra_minute is zero', () => {
    expect(formatEventMinute(makeEvent({ minute: 90, extra_minute: 0 }))).toBe("90'");
  });
});

describe('getPlayerName', () => {
  it('uses player_name when provided', () => {
    expect(getPlayerName(makeEvent({ player_name: 'Displayed Name' }))).toBe('Displayed Name');
  });

  it('falls back to nested player first and last name', () => {
    expect(getPlayerName(makeEvent({ player_name: null }))).toBe('A. Davies');
  });

  it('returns undefined string when no player name is available', () => {
    expect(getPlayerName(makeEvent({ player_name: null, player: null }))).toBe(undefined);
  });
});

describe('getSecondaryPlayerName', () => {
  it('uses secondary_player_name when provided', () => {
    expect(
      getSecondaryPlayerName(makeEvent({ secondary_player_name: 'Displayed Secondary Name' })),
    ).toBe('Displayed Secondary Name');
  });

  it('falls back to nested secondary player first and last name', () => {
    expect(getSecondaryPlayerName(makeEvent({ secondary_player_name: null }))).toBe('J. David');
  });

  it('returns an empty string when no secondary player name is available', () => {
    expect(
      getSecondaryPlayerName(
        makeEvent({
          secondary_player_name: null,
          secondary_player: null,
        }),
      ),
    ).toBe(undefined);
  });
});

describe('getEventConfig', () => {
  it.each([
    'goal',
    'penalty_goal',
    'own_goal',
    'penalty_miss',
    'yellow_card',
    'red_card',
    'substitution',
    'var',
    'other',
  ] as const)('returns the configured display config for %s', (eventType) => {
    expect(getEventConfig(eventType)).toBe(EVENT_CONFIG[eventType]);
  });
});

describe('addDisplayScoresToEvents', () => {
  it('adds running scores for regular goals by team', () => {
    const events = [
      makeEvent({ team: teamA, event_type: 'goal', minute: 10 }),
      makeEvent({ team: teamB, event_type: 'goal', minute: 20 }),
      makeEvent({ team: teamA, event_type: 'penalty_goal', minute: 30 }),
    ];

    expect(addDisplayScoresToEvents(events, baseMatch)).toEqual([
      { event: events[0], score: '1-0' },
      { event: events[1], score: '1-1' },
      { event: events[2], score: '2-1' },
    ]);
  });

  it('credits own goals to the correct team', () => {
    const events = [
      makeEvent({ team: teamA, event_type: 'own_goal', minute: 15 }),
      makeEvent({ team: teamB, event_type: 'own_goal', minute: 35 }),
    ];

    expect(addDisplayScoresToEvents(events, baseMatch)).toEqual([
      { event: events[0], score: '1-0' },
      { event: events[1], score: '1-1' },
    ]);
  });

  it('does not change regular score for non-scoring events', () => {
    const events = [
      makeEvent({ team: teamA, event_type: 'yellow_card', minute: 12 }),
      makeEvent({ team: teamB, event_type: 'substitution', minute: 55 }),
      makeEvent({ team: teamA, event_type: 'penalty_miss', minute: 75 }),
    ];

    expect(addDisplayScoresToEvents(events, baseMatch)).toEqual([
      { event: events[0], score: '0-0' },
      { event: events[1], score: '0-0' },
      { event: events[2], score: '0-0' },
    ]);
  });

  it('tracks penalty shootout scores separately from regular match score', () => {
    const regularGoal = makeEvent({
      team: teamA,
      event_type: 'goal',
      minute: 30,
      comments: null,
    });

    const teamAPenaltyGoal = makeEvent({
      team: teamA,
      event_type: 'penalty_goal',
      minute: 120,
      comments: PENALTY_SHOOTOUT_COMMENT,
    });

    const teamBPenaltyMiss = makeEvent({
      team: teamB,
      event_type: 'penalty_miss',
      minute: 120,
      comments: PENALTY_SHOOTOUT_COMMENT,
    });

    const teamBPenaltyGoal = makeEvent({
      team: teamB,
      event_type: 'penalty_goal',
      minute: 120,
      comments: PENALTY_SHOOTOUT_COMMENT,
    });

    const events = [regularGoal, teamAPenaltyGoal, teamBPenaltyMiss, teamBPenaltyGoal];

    expect(addDisplayScoresToEvents(events, baseMatch)).toEqual([
      { event: regularGoal, score: '1-0' },
      { event: teamAPenaltyGoal, score: '1-0' },
      { event: teamBPenaltyMiss, score: '1-0' },
      { event: teamBPenaltyGoal, score: '1-1' },
    ]);
  });

  it('does not count penalty shootout goals toward regular score after shootout ends', () => {
    const events = [
      makeEvent({
        team: teamA,
        event_type: 'penalty_goal',
        minute: 120,
        comments: PENALTY_SHOOTOUT_COMMENT,
      }),
      makeEvent({
        team: teamB,
        event_type: 'goal',
        minute: 121,
        comments: null,
      }),
    ];

    expect(addDisplayScoresToEvents(events, baseMatch)).toEqual([
      { event: events[0], score: '1-0' },
      { event: events[1], score: '0-1' },
    ]);
  });

  it('returns an empty array when there are no events', () => {
    expect(addDisplayScoresToEvents([], baseMatch)).toEqual([]);
  });
});
