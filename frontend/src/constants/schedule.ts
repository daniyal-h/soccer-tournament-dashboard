import { type MatchStatus } from '@/types/matches';

export const MATCH_STATUS_BADGE = {
  scheduled: {
    text: 'UPCOMING',
    className: 'border-blue-500 text-blue-600',
  },
  live: {
    text: 'LIVE',
    className: 'border-green-500 text-green-600',
  },
  finished: {
    text: 'FT',
    className: 'text-muted-foreground',
  },
  postponed: {
    text: 'POSTPONED',
    className: 'border-yellow-500 text-yellow-600',
  },
  cancelled: {
    text: 'CANCELLED',
    className: 'border-red-500 text-red-600',
  },
} satisfies Record<
  MatchStatus,
  {
    text: string;
    className: string;
  }
>;
