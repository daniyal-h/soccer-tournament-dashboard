import { apiGet } from './client';
import { type Tournament } from '@/types/tournament';

export function getTournaments() {
  return apiGet<Tournament[]>('/api/v1/tournaments/');
}
