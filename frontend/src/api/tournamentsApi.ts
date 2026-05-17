import { apiGet } from './client';

import { type Tournament } from '@/types/tournaments';

export function getTournaments() {
  return apiGet<Tournament[]>('/api/v1/tournaments/');
}
