import type { TeamProfile, TeamProfileOptions, TeamSummary } from '@/types/team';

import { apiGet } from './client';
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

export async function getTeamProfile({ tournament_id, team_id }: TeamProfileOptions) {
  const path = `/tournaments/${tournament_id}/teams/${team_id}/profile`;

  const data = await apiGet<TeamProfile>(path);

  if (!isTeamProfileResponse(data)) {
    throw new Error('Invalid team profile response');
  }

  return data;
}
