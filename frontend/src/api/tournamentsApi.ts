import { type Tournament } from '@/types/tournament';

import { apiGet } from './client';

export function getTournaments() {
  return apiGet<Tournament[]>('/tournaments/');
}
