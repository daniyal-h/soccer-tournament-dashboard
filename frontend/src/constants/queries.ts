import type { CategoryType } from '@/types/playerLeaderboard';

// keys to Frontend cache
export const queryKeys = {
  tournaments: {
    all: ['tournaments'] as const,
  },

  standings: {
    all: (tournamentId: number, group?: string) =>
      ['standings', tournamentId, group ?? 'all'] as const,
  },

  matches: {
    all: (tournamentId: number) => ['matches', tournamentId] as const,

    detail: (matchId: number) => ['matches', 'detail', matchId] as const,

    events: (matchId: number) => ['matches', matchId, 'events'] as const,
  },

  tournamentTeams: {
    all: (tournamentId: number) => ['tournamentTeams', tournamentId] as const,
  },

  teams: {
    profile: (tournamentId: number, teamId: number) =>
      ['teams', 'profile', tournamentId, teamId] as const,

    matches: (tournamentId: number, teamId: number) =>
      ['teams', 'matches', tournamentId, teamId] as const,

    squad: (tournamentId: number, teamId: number) =>
      ['teams', 'squad', tournamentId, teamId] as const,
  },

  playerLeaderboard: {
    all: (tournamentId: number, category: CategoryType) =>
      ['playerLeaderboard', category, tournamentId] as const,
  },

  bracket: {
    all: (tournamentId: number) => ['bracket', tournamentId] as const,
  },
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

export const QUERY_STALE_TIMES = {
  tournaments: 24 * HOUR,

  standings: 60 * MINUTE,

  matches: 5 * MINUTE,

  match: 1 * MINUTE,

  matchEvents: 45 * SECOND,

  tournamentTeams: 15 * MINUTE,

  teams: 5 * MINUTE,

  playerLeaderboard: 5 * MINUTE,

  bracket: 5 * MINUTE,
} as const;

export const QUERY_GC_TIMES = {
  default: 30 * MINUTE,
} as const;

export const RETRY_COUNT = 2;

export const AUTO_REFETCH_TIMES = {
  matches: 60 * SECOND,
  tournamentTeams: 5 * MINUTE,
} as const;
