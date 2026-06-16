import { type Match, type MatchesOptions, type MatchOptions } from '@/types/match';

import { apiGet } from './client';
import { isTeamSummary } from './teamsApi';

function isMatch(value: unknown): value is Match {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const match = value as Match;

  return (
    typeof match.id === 'number' &&
    typeof match.kickoff_time === 'string' &&
    typeof match.stage === 'string' &&
    typeof match.status === 'string' &&
    isTeamSummary(match.team_a) &&
    isTeamSummary(match.team_b) &&
    (typeof match.group === 'string' || match.group === null) &&
    (typeof match.venue === 'string' || match.venue === null) &&
    (typeof match.elapsed === 'number' || match.elapsed === null) &&
    (typeof match.team_a_score === 'number' || match.team_a_score === null) &&
    (typeof match.team_b_score === 'number' || match.team_b_score === null) &&
    (typeof match.city === 'string' || match.city === null) &&
    (typeof match.team_a_penalties === 'number' || match.team_a_penalties === null) &&
    (typeof match.team_b_penalties === 'number' || match.team_b_penalties === null)
  );
}

export function isMatchesResponse(value: unknown): value is Match[] {
  return Array.isArray(value) && value.every(isMatch);
}

export async function getMatch({ match_id }: MatchOptions) {
  const path = `/matches/${match_id}`;

  const data = await apiGet<Match>(path);

  if (!isMatch(data)) {
    throw new Error('Invalid match response');
  }

  return data;
}

export async function getMatches({ tournament_id }: MatchesOptions) {
  const path = `/tournaments/${tournament_id}/matches`;

  const data = await apiGet<Match[]>(path);

  if (!isMatchesResponse(data)) {
    throw new Error('Invalid matches response');
  }

  return data;
}
