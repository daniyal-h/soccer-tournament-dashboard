import type { PositionType } from '@/types/player';
import type { MatchFormResult } from '@/types/team';

export const TOTAL_GROUP_MATCHES_COUNT = 3;

export const FORM_LABELS: Record<MatchFormResult, string> = {
  W: 'Win',
  D: 'Draw',
  L: 'Loss',
};

export const VALID_POSITIONS = ['GK', 'DEF', 'MID', 'FWD'];

export const POSITION_LABELS: Record<PositionType | 'UNKNOWN', string> = {
  GK: 'Goalkeepers',
  DEF: 'Defenders',
  MID: 'Midfielders',
  FWD: 'Forwards',
  UNKNOWN: 'Other Players',
};
