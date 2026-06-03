import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Match } from '@/types/match';

import {
  getMatchCenterDisplay,
  getMatchMetaDisplay,
  getWinnerSide,
  groupMatchesByDay,
} from './matchCardHelper';

vi.mock('@/constants/matches', () => ({
  MATCH_STAGE_LABELS: {
    group: 'Group',
    round_of_32: 'Round of 32',
    round_of_16: 'Round of 16',
    quarter_final: 'Quarter-Finals',
    semi_final: 'Semi-Finals',
    third_place: 'Third Place',
    final: 'Final',
    other: 'Other',
  },
}));

const createMatch = (overrides: Partial<Match> = {}): Match => ({
  id: 1,
  team_a: {
    id: 10,
    name: 'Canada',
    short_name: 'CAN',
    logo_url: 'canada.png',
  },
  team_b: {
    id: 20,
    name: 'Brazil',
    short_name: 'BRA',
    logo_url: 'brazil.png',
  },
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'BC Place',
  city: 'Vancouver',
  ...overrides,
});

const baseMatch: Match = {
  id: 1,
  kickoff_time: '2026-06-11T19:00:00Z',
  stage: 'group',
  group: 'A',
  status: 'scheduled',
  venue: 'Estadio Azteca, Mexico City',
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
};

describe('matchCardHelper', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getMatchCenterDisplay', () => {
    it('returns formatted kickoff time for scheduled matches', () => {
      vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue('01:00 PM');

      expect(getMatchCenterDisplay(createMatch({ status: 'scheduled' }))).toBe('01:00 PM');
    });

    it('returns the score for live matches', () => {
      expect(
        getMatchCenterDisplay(
          createMatch({
            status: 'live',
            team_a_score: 2,
            team_b_score: 1,
          }),
        ),
      ).toBe('2 - 1');
    });

    it('returns the score for finished matches, including zero-zero', () => {
      expect(
        getMatchCenterDisplay(
          createMatch({
            status: 'finished',
            team_a_score: 0,
            team_b_score: 0,
          }),
        ),
      ).toBe('0 - 0');
    });

    it('returns cancelled label for cancelled matches', () => {
      expect(getMatchCenterDisplay(createMatch({ status: 'cancelled' }))).toBe('CANCELLED');
    });

    it('returns postponed label for postponed matches', () => {
      expect(getMatchCenterDisplay(createMatch({ status: 'postponed' }))).toBe('POSTPONED');
    });
  });

  describe('getMatchMetaDisplay', () => {
    it('returns group, venue, and city for group matches', () => {
      expect(getMatchMetaDisplay(createMatch())).toBe('Group A · BC Place · Vancouver');
    });

    it('uses stage label when the match is not a grouped group-stage match', () => {
      expect(
        getMatchMetaDisplay(
          createMatch({
            stage: 'final',
            group: undefined,
            venue: 'MetLife Stadium',
            city: 'New York',
          }),
        ),
      ).toBe('Final · MetLife Stadium · New York');
    });

    it('falls back to the generic group label when a group-stage match has no group', () => {
      expect(
        getMatchMetaDisplay(
          createMatch({
            stage: 'group',
            group: undefined,
            venue: undefined,
            city: undefined,
          }),
        ),
      ).toBe('Group');
    });

    it('omits venue when venue is missing', () => {
      expect(getMatchMetaDisplay(createMatch({ venue: undefined }))).toBe('Group A · Vancouver');
    });

    it('omits city when city is missing', () => {
      expect(getMatchMetaDisplay(createMatch({ city: undefined }))).toBe('Group A · BC Place');
    });
  });

  describe('groupMatchesByDay', () => {
    it('formats day labels through the private getMatchDay logic', () => {
      expect(groupMatchesByDay([createMatch()])).toEqual([
        {
          day: 'Jun 11',
          matches: [createMatch()],
        },
      ]);
    });

    it('sorts matches by kickoff time before grouping them', () => {
      const lateMatch = createMatch({
        id: 2,
        kickoff_time: '2026-06-12T22:00:00Z',
      });

      const earlyMatch = createMatch({
        id: 1,
        kickoff_time: '2026-06-11T19:00:00Z',
      });

      expect(groupMatchesByDay([lateMatch, earlyMatch])).toEqual([
        {
          day: 'Jun 11',
          matches: [earlyMatch],
        },
        {
          day: 'Jun 12',
          matches: [lateMatch],
        },
      ]);
    });

    it('groups matches from the same day together in sorted order', () => {
      const laterSameDay = createMatch({
        id: 2,
        kickoff_time: '2026-06-11T22:00:00Z',
      });

      const earlierSameDay = createMatch({
        id: 1,
        kickoff_time: '2026-06-11T19:00:00Z',
      });

      expect(groupMatchesByDay([laterSameDay, earlierSameDay])).toEqual([
        {
          day: 'Jun 11',
          matches: [earlierSameDay, laterSameDay],
        },
      ]);
    });

    it('keeps separate days separate after sorting', () => {
      const firstDayLate = createMatch({
        id: 1,
        kickoff_time: '2026-06-11T22:00:00Z',
      });

      const secondDay = createMatch({
        id: 2,
        kickoff_time: '2026-06-12T19:00:00Z',
      });

      const firstDayEarly = createMatch({
        id: 3,
        kickoff_time: '2026-06-11T18:00:00Z',
      });

      expect(groupMatchesByDay([firstDayLate, secondDay, firstDayEarly])).toEqual([
        {
          day: 'Jun 11',
          matches: [firstDayEarly, firstDayLate],
        },
        {
          day: 'Jun 12',
          matches: [secondDay],
        },
      ]);
    });

    it('returns an empty list when there are no matches', () => {
      expect(groupMatchesByDay([])).toEqual([]);
    });

    it('does not mutate the original matches array', () => {
      const lateMatch = createMatch({
        id: 2,
        kickoff_time: '2026-06-12T22:00:00Z',
      });

      const earlyMatch = createMatch({
        id: 1,
        kickoff_time: '2026-06-11T19:00:00Z',
      });

      const matches = [lateMatch, earlyMatch];

      groupMatchesByDay(matches);

      expect(matches).toEqual([lateMatch, earlyMatch]);
    });
  });
});

describe('getWinnerSide', () => {
  it('returns team_a when team A wins by score', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 2,
        team_b_score: 1,
      }),
    ).toBe('team_a');
  });

  it('returns team_b when team B wins by score', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 0,
        team_b_score: 3,
      }),
    ).toBe('team_b');
  });

  it('returns team_a when tied score is decided by penalties', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 1,
        team_b_score: 1,
        team_a_penalties: 5,
        team_b_penalties: 4,
      }),
    ).toBe('team_a');
  });

  it('returns team_b when tied score is decided by penalties', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 2,
        team_b_score: 2,
        team_a_penalties: 3,
        team_b_penalties: 4,
      }),
    ).toBe('team_b');
  });

  it('supports zero penalty values', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 0,
        team_b_score: 0,
        team_a_penalties: 0,
        team_b_penalties: 2,
      }),
    ).toBe('team_b');
  });

  it('returns null for a finished draw without penalties', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 1,
        team_b_score: 1,
      }),
    ).toBeNull();
  });

  it('returns null when only one penalty value exists', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'finished',
        team_a_score: 1,
        team_b_score: 1,
        team_a_penalties: 4,
      }),
    ).toBeNull();
  });

  it('returns null for non-finished matches even if scores exist', () => {
    expect(
      getWinnerSide({
        ...baseMatch,
        status: 'live',
        team_a_score: 2,
        team_b_score: 1,
      }),
    ).toBeNull();
  });
});
