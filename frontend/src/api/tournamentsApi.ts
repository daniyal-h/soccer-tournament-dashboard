import { apiGet } from './client';
import { type Tournament } from '@/types/tournament';

export function getTournaments() {
  return apiGet<Tournament[]>('/tournaments/');
}
