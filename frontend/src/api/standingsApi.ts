import { apiGet } from './client';
import type { Standing } from '@/types/standings';

interface StandingsOptions {
  tournamentId: number;
  group?: string;
}

export function getStandings({ tournamentId, group }: StandingsOptions) {
  const params = new URLSearchParams();

  if (group) {
    params.set('group', group);
  }

  // if group is given, include it in the path as a query filter
  const queryString = params.toString();
  const path = `/standings/${tournamentId}${queryString ? '?' + queryString : ''}`;

  return apiGet<Record<string, Standing[]>>(path);
}
