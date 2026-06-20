import type { TournamentTeam, TournamentTeamOptions } from '@/types/tournamentTeam';

import { apiGet } from './client';
import { isTeamSummary } from './teamsApi';

function isTournamentTeam(value: unknown): value is TournamentTeam {
  // Stryker disable next-line ConditionalExpression
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const tournamentTeam = value as TournamentTeam;

  return (
    isTeamSummary(tournamentTeam.team) &&
    (typeof tournamentTeam.group === 'string' || tournamentTeam.group === null) &&
    (typeof tournamentTeam.final_rank === 'number' || tournamentTeam.final_rank === null) &&
    (typeof tournamentTeam.stage_reached === 'string' || tournamentTeam.stage_reached === null)
  );
}

function isTournamentTeamsResponse(value: unknown): value is TournamentTeam[] {
  return Array.isArray(value) && value.every(isTournamentTeam);
}

export async function getTournamentTeams({ tournament_id }: TournamentTeamOptions) {
  const path = `/tournaments/${tournament_id}/teams`;

  const data = await apiGet<TournamentTeam[]>(path);

  if (!isTournamentTeamsResponse(data)) {
    throw new Error('Invalid tournament teams response');
  }

  return data;
}
