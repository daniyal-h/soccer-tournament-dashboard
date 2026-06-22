import type { MatchStage } from '@/types/match';

import { MATCH_STAGE_LABELS } from './matches';

export type StageFilter = MatchStage | 'all';

export const TEAM_STAGE_LABELS: Record<MatchStage, string> = {
  ...MATCH_STAGE_LABELS,
  third_place: 'Third Place Match',
  group: 'Group Stage',
};

export const STAGE_FILTER_ORDER: MatchStage[] = [
  'final',
  'third_place',
  'semi_final',
  'quarter_final',
  'round_of_16',
  'round_of_32',
  'group',
  'other',
];

export const RANK_CARD_STYLES: Record<number, string> = {
  1: 'border-yellow-500/50 bg-yellow-500/10',
  2: 'border-slate-500/50 bg-slate-500/10 dark:border-slate-300/50 dark:bg-slate-300/10',
  3: 'border-amber-700/50 bg-amber-700/10 dark:border-orange-600/50 dark:bg-orange-600/10',
} as const;
