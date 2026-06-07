import type { Tournament } from '@/types/tournament';

import { apiGet } from './client';

function isTournament(value: unknown): value is Tournament {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Tournament).id === 'number' &&
    typeof (value as Tournament).name === 'string' &&
    typeof (value as Tournament).season === 'string' &&
    ((value as Tournament).logo_url === null ||
      typeof (value as Tournament).logo_url === 'string') &&
    typeof (value as Tournament).start_date === 'string' &&
    typeof (value as Tournament).end_date === 'string'
  );
}

function isTournamentArray(value: unknown): value is Tournament[] {
  return Array.isArray(value) && value.every(isTournament);
}

export async function getTournaments() {
  const data = await apiGet<unknown>('/tournaments');

  if (!isTournamentArray(data)) {
    throw new Error('Invalid tournaments response');
  }

  return data;
}
