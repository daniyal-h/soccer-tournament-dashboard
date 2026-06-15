export const ROUTES = {
  STANDINGS: '/',
  SCHEDULE: '/schedule',
  BRACKET: '/bracket',
  TEAMS: '/teams',
  STATISTICS: '/stats',
  MATCH_DETAILS: (matchId: number) => `/matches/${matchId}`,
};

export const BACK_ROUTE_LABELS: Record<string, string> = {
  [ROUTES.TEAMS]: 'Teams',
  [ROUTES.SCHEDULE]: 'Schedule',
  [ROUTES.STANDINGS]: 'Standings',
};

export const PRIMARY_NAV_ITEMS = [
  { label: 'Standings', to: ROUTES.STANDINGS },
  { label: 'Schedule', to: ROUTES.SCHEDULE },
];

export const NAV_ITEMS = [
  { label: 'Standings', to: ROUTES.STANDINGS },
  { label: 'Schedule', to: ROUTES.SCHEDULE },
  { label: 'Bracket', to: ROUTES.BRACKET },
  { label: 'Teams', to: ROUTES.TEAMS },
  { label: 'Statistics', to: ROUTES.STATISTICS },
];
