import { describe, expect, it } from 'vitest';

import type { BracketResponse } from '@/types/bracket';
import type { Match } from '@/types/match';

import { MATCH_STAGE_LABELS } from '@/constants/matches';

import { getBracketRounds, hasBracketMatches } from './bracketHelper';

function makeMatch(id: number, stage = 'final') {
  return {
    id,
    stage,
  } as Match;
}

function makeBracket(overrides: Partial<BracketResponse> = {}): BracketResponse {
  return {
    round_of_32: [],
    round_of_16: [],
    quarter_final: [],
    semi_final: [],
    third_place: [],
    final: [],
    ...overrides,
  };
}

describe('hasBracketMatches', () => {
  it('returns false when all stages are empty', () => {
    expect(hasBracketMatches(makeBracket())).toBe(false);
  });

  it.each([
    'round_of_32',
    'round_of_16',
    'quarter_final',
    'semi_final',
    'third_place',
    'final',
  ] as const)('returns true when %s has matches', (stage) => {
    const bracket = makeBracket({
      [stage]: [makeMatch(1, stage)],
    });

    expect(hasBracketMatches(bracket)).toBe(true);
  });
});

describe('getBracketRounds', () => {
  it('removes empty rounds', () => {
    const bracket = makeBracket({
      semi_final: [makeMatch(1, 'semi_final')],
      final: [makeMatch(2, 'final')],
    });

    const rounds = getBracketRounds(bracket);

    expect(rounds).toHaveLength(2);
    expect(rounds.map((round) => round.stage)).toEqual(['semi_final', 'final']);
  });

  it('returns rounds in tournament order', () => {
    const bracket = makeBracket({
      final: [makeMatch(4, 'final')],
      round_of_16: [makeMatch(1, 'round_of_16')],
      semi_final: [makeMatch(3, 'semi_final')],
      quarter_final: [makeMatch(2, 'quarter_final')],
    });

    const rounds = getBracketRounds(bracket);

    expect(rounds.map((round) => round.stage)).toEqual([
      'round_of_16',
      'quarter_final',
      'semi_final',
      'final',
    ]);
  });

  it('adds display labels for each round', () => {
    const bracket = makeBracket({
      quarter_final: [makeMatch(1, 'quarter_final')],
    });

    const rounds = getBracketRounds(bracket);

    expect(rounds[0]).toMatchObject({
      stage: 'quarter_final',
      title: MATCH_STAGE_LABELS.quarter_final,
    });
  });

  it('preserves the original matches in each round', () => {
    const matches = [makeMatch(1, 'final'), makeMatch(2, 'final')];

    const bracket = makeBracket({
      final: matches,
    });

    const rounds = getBracketRounds(bracket);

    expect(rounds[0].matches).toBe(matches);
    expect(rounds[0].matches).toHaveLength(2);
  });

  it('returns an empty list when no bracket rounds exist', () => {
    expect(getBracketRounds(makeBracket())).toEqual([]);
  });
});
