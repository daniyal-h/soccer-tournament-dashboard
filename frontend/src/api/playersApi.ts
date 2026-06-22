import type { PlayerSimpleSummary, PlayerSummary } from '@/types/player';

export function isPlayerSimpleSummary(value: unknown): value is PlayerSimpleSummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const player = value as PlayerSimpleSummary;

  return (
    typeof player.id === 'number' &&
    typeof player.display_name === 'string' &&
    (typeof player.photo_url === 'string' || player.photo_url === null)
  );
}

export function isPlayerSummary(value: unknown): value is PlayerSummary {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const player = value as PlayerSummary;

  return (
    isPlayerSimpleSummary(value) &&
    (typeof player.first_name === 'string' || player.first_name === null) &&
    (typeof player.last_name === 'string' || player.last_name === null) &&
    (typeof player.nationality === 'string' || player.nationality === null) &&
    (typeof player.date_of_birth === 'string' || player.date_of_birth === null) &&
    (typeof player.height === 'number' || player.height === null)
  );
}
