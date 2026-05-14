type NavItem = {
  to: string;
  label: string;
};

export interface NavProps {
  navItems: NavItem[];
}

export const PRIMARY_NAV_ITEMS = [
  { label: 'Standings', to: '/' },
  { label: 'Schedule', to: '/schedule' },
];

export const NAV_ITEMS = [
  { label: 'Standings', to: '/' },
  { label: 'Schedule', to: '/schedule' },
  { label: 'Bracket', to: '/bracket' },
  { label: 'Teams', to: '/teams' },
  { label: 'Statistics', to: '/stats' },
];
