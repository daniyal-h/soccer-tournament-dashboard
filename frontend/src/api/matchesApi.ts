import { type Match, type MatchesOptions } from '@/types/matches';

import { apiGet } from './client';

function isMatch(value: unknown): value is Match {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Match).id === 'number' &&
    typeof (value as Match).kickoff_time === 'string' &&
    typeof (value as Match).stage === 'string' &&
    typeof (value as Match).status === 'string' &&
    typeof (value as Match).team_a === 'object' &&
    typeof (value as Match).team_b === 'object'
  );
}

function isMatchesResponse(value: unknown): value is Match[] {
  return Array.isArray(value) && value.every(isMatch);
}

export async function getMatches({ tournament_id }: MatchesOptions) {
  const path = `/tournaments/${tournament_id}/matches`;

  const data = await apiGet<Match[]>(path);

  if (!isMatchesResponse(data)) {
    throw new Error('Invalid matches response');
  }

  return data;
}
