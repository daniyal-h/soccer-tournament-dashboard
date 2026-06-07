import type { Standing, StandingsOptions } from '@/types/standing';

import { apiGet } from './client';

function isStandingsResponse(value: unknown): value is Record<string, Standing[]> {
  return (
    typeof value === 'object' &&
    value !== null &&
    Object.values(value).every((rows) => Array.isArray(rows))
  );
}

export async function getStandings({ tournament_id, group }: StandingsOptions) {
  const params = new URLSearchParams();

  if (group) {
    params.set('group', group);
  }

  // if group is given, include it in the path as a query filter
  const queryString = params.toString();
  const path = `/tournaments/${tournament_id}/standings${queryString ? '?' + queryString : ''}`;

  const data = await apiGet<Record<string, Standing[]>>(path);

  if (!isStandingsResponse(data)) {
    throw new Error('Invalid standings response');
  }

  return data;
}
