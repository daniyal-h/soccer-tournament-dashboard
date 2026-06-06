import type { Player } from '@/types/player';

export function isPlayerSummary(value: unknown): value is Player {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const player = value as Player;

  return (
    typeof player.id === 'number' &&
    typeof player.first_name === 'string' &&
    typeof player.last_name === 'string' &&
    (typeof player.photo_url === 'string' || player.photo_url === null)
  );
}
