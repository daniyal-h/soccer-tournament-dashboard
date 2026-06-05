import type { Team } from '@/types/team';

export function isTeam(value: unknown): value is Team {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const team = value as Team;

  return (
    typeof team.id === 'number' &&
    typeof team.name === 'string' &&
    typeof team.short_name === 'string' &&
    (typeof team.logo_url === 'string' || team.logo_url === null)
  );
}
