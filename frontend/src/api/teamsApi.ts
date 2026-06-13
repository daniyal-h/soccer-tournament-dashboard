import type { TeamSummary } from '@/types/team';

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
