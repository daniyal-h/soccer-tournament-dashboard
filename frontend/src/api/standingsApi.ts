import type { Standing, StandingsOptions, StandingStats } from '@/types/standing';

import { apiGet } from './client';
import { isTeamSummary } from './teamsApi';

export function isStandingStats(value: unknown): value is StandingStats {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const stats = value as StandingStats;

  return (
    typeof stats.position === 'number' &&
    typeof stats.matches_played === 'number' &&
    typeof stats.wins === 'number' &&
    typeof stats.draws === 'number' &&
    typeof stats.losses === 'number' &&
    typeof stats.goals_for === 'number' &&
    typeof stats.goals_against === 'number' &&
    typeof stats.goal_difference === 'number' &&
    typeof stats.points === 'number'
  );
}

function isStanding(value: unknown): value is Standing {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const standing = value as Standing;

  return isTeamSummary(standing.team) && isStandingStats(standing);
}

function isStandingsResponse(value: unknown): value is Record<string, Standing[]> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(([group, rows]) => {
    return typeof group === 'string' && Array.isArray(rows) && rows.every(isStanding);
  });
}

export async function getStandings({ tournamentId, group }: StandingsOptions) {
  const params = new URLSearchParams();

  if (group) {
    params.set('group', group);
  }

  // if group is given, include it in the path as a query filter
  const queryString = params.toString();
  const path = `/tournaments/${tournamentId}/standings${queryString ? '?' + queryString : ''}`;

  const data = await apiGet<Record<string, Standing[]>>(path);

  if (!isStandingsResponse(data)) {
    throw new Error('Invalid standings response');
  }

  return data;
}
