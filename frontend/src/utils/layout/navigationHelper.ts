import { BACK_ROUTE_LABELS } from '@/constants/navigation';

export function isNavItemActive(pathname: string, navPath: string): boolean {
  if (navPath === '/schedule') {
    return pathname === '/schedule' || pathname.startsWith('/matches/');
  }

  return pathname === navPath || pathname.startsWith(`${navPath}/`);
}

export function getBackLabel(path: string): string {
  if (path.startsWith('/matches/')) {
    return 'Match';
  }

  return BACK_ROUTE_LABELS[path] ?? 'Previous Page';
}
