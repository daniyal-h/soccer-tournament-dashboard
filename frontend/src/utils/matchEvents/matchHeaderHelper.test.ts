import { describe, expect, it } from 'vitest';

import type { Match } from '@/types/match';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

import { formatMatchDate, formatStage, getScoreText } from '@/utils/matchEvents/matchHeaderHelper';

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
    expect(formatStage(makeMatch({ stage: 'final', group: 'A' }))).toBe(
      MATCH_STAGE_LABELS.final,
    );
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
