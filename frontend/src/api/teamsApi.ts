import type { PositionType } from '@/types/player';
import type {
  TeamMatchesApiResponse,
  TeamProfile,
  TeamSquad,
  TeamSquadApiResponse,
  TeamSummary,
  TournamentTeamOptions,
} from '@/types/team';

import { VALID_POSITIONS } from '@/constants/teams';

import { apiGet } from './client';
import { isMatchesResponse } from './matchesApi';
import { isPlayerSummary } from './playersApi';
import { isStandingStats } from './standingsApi';

export function isTeamSummary(value: unknown): value is TeamSummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const team = value as TeamSummary;

  return (
    typeof team.id === 'number' &&
    typeof team.name === 'string' &&
    typeof team.short_name === 'string' &&
    (typeof team.logo_url === 'string' || team.logo_url === null)
  );
}

function isTeamProfileResponse(value: unknown): value is TeamProfile {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const teamProfile = value as TeamProfile;

  return (
    isTeamSummary(teamProfile.team) &&
    typeof teamProfile.group === 'string' &&
    (isStandingStats(teamProfile.standing) || teamProfile.standing === null)
  );
}

function isTeamMatchesResponse(value: unknown): value is TeamMatchesApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as TeamMatchesApiResponse;

  return isMatchesResponse(response.data);
}

export function isSquadMember(value: unknown): value is TeamSquad {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const squad = value as TeamSquad;

  return (
    isPlayerSummary(squad.player) &&
    (typeof squad.squad_number === 'number' || squad.squad_number === null) &&
    (VALID_POSITIONS.includes(squad.position as PositionType) || squad.position === null)
  );
}

export function isTeamSquadResponse(value: unknown): value is TeamSquadApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const response = value as TeamSquadApiResponse;

  return Array.isArray(response.data) && response.data.every(isSquadMember);
}

export async function getTeamProfile({ tournament_id, team_id }: TournamentTeamOptions) {
  const path = `/tournaments/${tournament_id}/teams/${team_id}/profile`;

  const data = await apiGet<TeamProfile>(path);

  if (!isTeamProfileResponse(data)) {
    throw new Error('Invalid team profile response');
  }

  return data;
}

export async function getTeamMatches({ tournament_id, team_id }: TournamentTeamOptions) {
  const path = `/tournaments/${tournament_id}/teams/${team_id}/matches`;

  const response = await apiGet<TeamMatchesApiResponse>(path);

  if (!isTeamMatchesResponse(response)) {
    throw new Error('Invalid team matches response');
  }

  return {
    matches: response.data,
  };
}

export async function getTeamSquad({ tournament_id, team_id }: TournamentTeamOptions) {
  const path = `/tournaments/${tournament_id}/teams/${team_id}/squad`;

  const response = await apiGet<TeamSquadApiResponse>(path);

  if (!isTeamSquadResponse(response)) {
    throw new Error('Invalid team squad response');
  }

  return {
    squad: response.data,
  };
}
