// keys to Frontend cache
export const queryKeys = {
  tournaments: {
    all: ['tournaments'] as const,
  },

  standings: {
    all: (tournamentId: number) => ['standings', tournamentId] as const,
  },

  matches: {
    all: (tournamentId: number) => ['matches', tournamentId] as const,

    detail: (matchId: number) => ['matches', 'detail', matchId] as const,

    events: (matchId: number) => ['matches', matchId, 'events'] as const,
  },
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const QUERY_STALE_TIMES = {
  tournaments: 24 * HOUR,

  standings: 4 * MINUTE,

  matches: 4 * MINUTE,

  match: 4 * MINUTE,

  matchEvents: 45 * SECOND,
} as const;

export const QUERY_GC_TIMES = {
  default: 30 * MINUTE,
} as const;

export const RETRY_COUNT = 2;
