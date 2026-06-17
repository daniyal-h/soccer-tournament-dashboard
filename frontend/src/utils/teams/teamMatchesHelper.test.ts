import { describe, expect, it } from 'vitest';

import type { Match } from '@/types/match';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

import { getRecentForm, groupMatchesByStage } from './teamMatchesHelper';

const canada = {
  id: 1,
  name: 'Canada',
  short_name: 'CAN',
  logo_url: null,
};

const brazil = {
  id: 2,
  name: 'Brazil',
  short_name: 'BRA',
  logo_url: null,
};

const argentina = {
  id: 3,
  name: 'Argentina',
  short_name: 'ARG',
  logo_url: null,
};

function makeMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 100,
    team_a: canada,
    team_b: brazil,
    kickoff_time: '2026-06-12T20:00:00Z',
    stage: 'group',
    group: 'A',
    status: 'finished',
    venue: 'BC Place',
    city: 'Vancouver',
    elapsed: 90,
    team_a_score: 1,
    team_b_score: 0,
    team_a_penalties: null,
    team_b_penalties: null,
    ...overrides,
  };
}

describe('groupMatchesByStage', () => {
  it('groups matches by stage while preserving kickoff order inside each group', () => {
    const groupMatchOne = makeMatch({ id: 1, stage: 'group' });
    const finalMatch = makeMatch({ id: 2, stage: 'final' });
    const groupMatchTwo = makeMatch({ id: 3, stage: 'group' });

    const result = groupMatchesByStage([groupMatchOne, finalMatch, groupMatchTwo]);

    expect(result).toEqual([
      {
        stage: 'group',
        label: MATCH_STAGE_LABELS.group,
        matches: [groupMatchOne, groupMatchTwo],
      },
      {
        stage: 'final',
        label: MATCH_STAGE_LABELS.final,
        matches: [finalMatch],
      },
    ]);
  });

  it('returns an empty list when no matches are provided', () => {
    expect(groupMatchesByStage([])).toEqual([]);
  });
});

describe('getRecentForm', () => {
  it('returns win when the selected team wins as team_a', () => {
    const result = getRecentForm([makeMatch({ team_a_score: 2, team_b_score: 1 })], canada.id);

    expect(result).toEqual(['W']);
  });

  it('returns loss when the selected team loses as team_a', () => {
    const result = getRecentForm([makeMatch({ team_a_score: 0, team_b_score: 1 })], canada.id);

    expect(result).toEqual(['L']);
  });

  it('returns win when the selected team wins as team_b', () => {
    const result = getRecentForm([makeMatch({ team_a_score: 0, team_b_score: 1 })], brazil.id);

    expect(result).toEqual(['W']);
  });

  it('returns loss when the selected team loses as team_b', () => {
    const result = getRecentForm([makeMatch({ team_a_score: 2, team_b_score: 1 })], brazil.id);

    expect(result).toEqual(['L']);
  });

  it('returns draw for a finished tied match with no penalty winner', () => {
    const result = getRecentForm([makeMatch({ team_a_score: 1, team_b_score: 1 })], canada.id);

    expect(result).toEqual(['D']);
  });

  it('uses penalties to determine win and loss when goals are tied', () => {
    const penaltyWin = makeMatch({
      id: 1,
      team_a_score: 1,
      team_b_score: 1,
      team_a_penalties: 5,
      team_b_penalties: 4,
    });
    const penaltyLoss = makeMatch({
      id: 2,
      team_a_score: 2,
      team_b_score: 2,
      team_a_penalties: 3,
      team_b_penalties: 4,
    });

    expect(getRecentForm([penaltyWin], canada.id)).toEqual(['W']);
    expect(getRecentForm([penaltyLoss], canada.id)).toEqual(['L']);
  });

  it('ignores unfinished matches', () => {
    const result = getRecentForm(
      [
        makeMatch({ id: 1, status: 'scheduled', team_a_score: null, team_b_score: null }),
        makeMatch({ id: 2, status: 'live', team_a_score: 1, team_b_score: 0 }),
        makeMatch({ id: 3, status: 'finished', team_a_score: 1, team_b_score: 0 }),
      ],
      canada.id,
    );

    expect(result).toEqual(['W']);
  });

  it('ignores matches that do not include the selected team', () => {
    const result = getRecentForm(
      [
        makeMatch({
          team_a: brazil,
          team_b: argentina,
          team_a_score: 1,
          team_b_score: 0,
        }),
        makeMatch({ team_a_score: 1, team_b_score: 0 }),
      ],
      canada.id,
    );

    expect(result).toEqual(['W']);
  });

  it('returns only the last five completed results', () => {
    const matches = [
      makeMatch({ id: 1, team_a_score: 1, team_b_score: 0 }),
      makeMatch({ id: 2, team_a_score: 0, team_b_score: 1 }),
      makeMatch({ id: 3, team_a_score: 1, team_b_score: 1 }),
      makeMatch({ id: 4, team_a_score: 2, team_b_score: 0 }),
      makeMatch({ id: 5, team_a_score: 0, team_b_score: 2 }),
      makeMatch({ id: 6, team_a_score: 3, team_b_score: 1 }),
    ];

    expect(getRecentForm(matches, canada.id)).toEqual(['L', 'D', 'W', 'L', 'W']);
  });

  it('returns an empty list when no completed matches produce a result', () => {
    const result = getRecentForm(
      [
        makeMatch({ status: 'scheduled', team_a_score: null, team_b_score: null }),
        makeMatch({ team_a: brazil, team_b: argentina }),
      ],
      canada.id,
    );

    expect(result).toEqual([]);
  });
});
