export function isNavItemActive(pathname: string, navPath: string): boolean {
  if (navPath === '/schedule') {
    return pathname === '/schedule' || pathname.startsWith('/matches/');
  }

  return pathname === navPath || pathname.startsWith(`${navPath}/`);
}
