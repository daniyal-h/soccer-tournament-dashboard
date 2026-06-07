import { describe, expect, it } from 'vitest';

import type { Match } from '@/types/match';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

import {
  formatMatchDate,
  formatStage,
  getRelativeTime,
  getScoreText,
} from '@/utils/matchEvents/matchHeaderHelper';

const teamA = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: null,
};

const teamB = {
  id: 2,
  name: 'Belgium',
  short_name: 'BEL',
  logo_url: null,
};

const baseMatch: Match = {
  id: 1,
  team_a: teamA,
  team_b: teamB,
  kickoff_time: '2026-06-12T20:30:00Z',
  stage: 'group',
  group: 'B',
  status: 'scheduled',
  elapsed: 0,
  team_a_score: null,
  team_b_score: null,
  venue: 'BMO Field',
  city: null,
  team_a_penalties: null,
  team_b_penalties: null,
};

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    ...baseMatch,
    ...overrides,
  };
}

describe('formatMatchDate', () => {
  it('formats kickoff time with month, day, year, hour, and minute', () => {
    expect(formatMatchDate('2026-06-12T20:30:00Z')).toMatch(/^Jun 12, 2026, \d{1,2}:30 (AM|PM)$/);
  });

  it('preserves two-digit minute formatting', () => {
    expect(formatMatchDate('2026-06-12T20:05:00Z')).toMatch(/^Jun 12, 2026, \d{1,2}:05 (AM|PM)$/);
  });
});

describe('formatStage', () => {
  it('returns group label when match is a group-stage match with a group', () => {
    expect(formatStage(makeMatch({ stage: 'group', group: 'A' }))).toBe('Group A');
  });

  it('falls back to configured group-stage label when group is missing', () => {
    expect(formatStage(makeMatch({ stage: 'group', group: null }))).toBe(MATCH_STAGE_LABELS.group);
  });

  it('uses configured stage label for knockout matches even when group exists', () => {
    expect(formatStage(makeMatch({ stage: 'final', group: 'A' }))).toBe(MATCH_STAGE_LABELS.final);
  });

  it('uses configured stage label for other matches', () => {
    expect(formatStage(makeMatch({ stage: 'other', group: null }))).toBe(MATCH_STAGE_LABELS.other);
  });
});

describe('getScoreText', () => {
  it('returns VS for scheduled matches even when scores are present', () => {
    expect(
      getScoreText(
        makeMatch({
          status: 'scheduled',
          team_a_score: 2,
          team_b_score: 1,
        }),
      ),
    ).toBe('VS');
  });

  it('returns the score for live matches', () => {
    expect(
      getScoreText(
        makeMatch({
          status: 'live',
          team_a_score: 2,
          team_b_score: 1,
        }),
      ),
    ).toBe('2 - 1');
  });

  it('returns the score for finished matches', () => {
    expect(
      getScoreText(
        makeMatch({
          status: 'finished',
          team_a_score: 0,
          team_b_score: 3,
        }),
      ),
    ).toBe('0 - 3');
  });

  it('uses zero fallback for missing scores on non-scheduled matches', () => {
    expect(
      getScoreText(
        makeMatch({
          status: 'postponed',
          team_a_score: null,
          team_b_score: null,
        }),
      ),
    ).toBe('0 - 0');
  });

  it('does not replace valid zero scores with fallback values', () => {
    expect(
      getScoreText(
        makeMatch({
          status: 'cancelled',
          team_a_score: 0,
          team_b_score: 1,
        }),
      ),
    ).toBe('0 - 1');
  });
});

const NOW = new Date('2026-06-07T12:00:00.000Z').getTime();

describe('getRelativeTime', () => {
  it.each([
    ['2026-06-07T11:59:31.000Z', '29 seconds ago'],
    ['2026-06-07T11:59:30.000Z', '30 seconds ago'],
    ['2026-06-07T12:00:29.000Z', 'in 29 seconds'],
    ['2026-06-07T12:00:30.000Z', 'in 30 seconds'],
  ])('formats second-level differences for %s', (timestamp, expected) => {
    expect(getRelativeTime(timestamp, NOW)).toBe(expected);
  });

  it.each([
    ['2026-06-07T11:59:00.000Z', '1 minute ago'],
    ['2026-06-07T11:58:31.000Z', '1 minute ago'],
    ['2026-06-07T11:58:29.000Z', '2 minutes ago'],
    ['2026-06-07T12:01:00.000Z', 'in 1 minute'],
    ['2026-06-07T12:02:29.000Z', 'in 2 minutes'],
  ])('formats minute-level differences for %s', (timestamp, expected) => {
    expect(getRelativeTime(timestamp, NOW)).toBe(expected);
  });

  it.each([
    ['2026-06-07T11:00:00.000Z', '1 hour ago'],
    ['2026-06-07T10:31:00.000Z', '1 hour ago'],
    ['2026-06-07T10:29:00.000Z', '2 hours ago'],
    ['2026-06-07T13:00:00.000Z', 'in 1 hour'],
    ['2026-06-07T13:31:00.000Z', 'in 2 hours'],
  ])('formats hour-level differences for %s', (timestamp, expected) => {
    expect(getRelativeTime(timestamp, NOW)).toBe(expected);
  });

  it.each([
    ['2026-06-06T12:00:00.000Z', 'yesterday'],
    ['2026-06-05T12:00:00.000Z', '2 days ago'],
    ['2026-06-08T12:00:00.000Z', 'tomorrow'],
    ['2026-06-09T12:00:00.000Z', 'in 2 days'],
  ])('formats day-level differences for %s', (timestamp, expected) => {
    expect(getRelativeTime(timestamp, NOW)).toBe(expected);
  });

  it('uses seconds below the one minute boundary', () => {
    expect(getRelativeTime('2026-06-07T11:59:01.000Z', NOW)).toBe('59 seconds ago');
  });

  it('uses minutes at exactly the one minute boundary', () => {
    expect(getRelativeTime('2026-06-07T11:59:00.000Z', NOW)).toBe('1 minute ago');
  });

  it('uses hours at exactly the one hour boundary', () => {
    expect(getRelativeTime('2026-06-07T11:00:00.000Z', NOW)).toBe('1 hour ago');
  });

  it('uses days at exactly the one day boundary', () => {
    expect(getRelativeTime('2026-06-06T12:00:00.000Z', NOW)).toBe('yesterday');
  });

  it('formats the current timestamp as now', () => {
    expect(getRelativeTime('2026-06-07T12:00:00.000Z', NOW)).toBe('now');
  });
});
