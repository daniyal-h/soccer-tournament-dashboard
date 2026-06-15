import { BACK_ROUTE_LABELS } from '@/constants/navigation';

export function getBackLabel(path: string): string {
  if (path.startsWith('/matches/')) {
    return 'Match';
  }

  return BACK_ROUTE_LABELS[path] ?? 'Previous Page';
}
