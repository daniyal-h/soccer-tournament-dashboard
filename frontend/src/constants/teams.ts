import type { MatchFormResult } from '@/types/team';

export const TOTAL_GROUP_MATCHES_COUNT = 3;

export const FORM_LABELS: Record<MatchFormResult, string> = {
  W: 'Win',
  D: 'Draw',
  L: 'Loss',
};

export const VALID_POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];
