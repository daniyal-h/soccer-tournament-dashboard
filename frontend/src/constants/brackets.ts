import type { BracketResponse } from '@/types/bracket';
import type { MatchStage } from '@/types/match';

export const EMPTY_BRACKET: BracketResponse = {
  round_of_32: [],
  round_of_16: [],
  quarter_final: [],
  semi_final: [],
  third_place: [],
  final: [],
};

export const BRACKET_STAGE_ORDER = [
  'round_of_32',
  'round_of_16',
  'quarter_final',
  'semi_final',
  'third_place',
  'final',
] as const;

export const COMPACT_STAGE_LABELS: Record<MatchStage, string> = {
  group: 'Group',
  round_of_32: 'R32',
  round_of_16: 'R16',
  quarter_final: 'QF',
  semi_final: 'SF',
  third_place: '3rd',
  final: 'Final',
  other: 'Other',
};
